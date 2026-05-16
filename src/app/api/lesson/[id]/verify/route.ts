import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runVerification, runStaticVerification } from "@/lib/genlayer/verify";
import { getSpec } from "@/lib/curriculum/specs";
import type { ProjectPath } from "@/lib/curriculum/metadata";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const lessonId = parseInt(params.id, 10);
  const body = await req.json();
  const { contractAddress, code } = body as { contractAddress?: string; code?: string };
  const projectPath = session.user.projectPath as ProjectPath;

  const spec = await getSpec(lessonId, projectPath);
  if (!spec) {
    return NextResponse.json({ error: "No spec for this lesson" }, { status: 404 });
  }

  // Run static analysis if code was submitted
  let staticResult: { passed: boolean; failures: string[] } | undefined;
  if (code) {
    staticResult = runStaticVerification(code, spec.staticChecks ?? {});
  }

  // Run RPC verification if contract address provided; fall back to static-only
  let rpcResult: Awaited<ReturnType<typeof runVerification>> | undefined;
  if (contractAddress) {
    try {
      rpcResult = await runVerification(contractAddress, spec);
    } catch {
      // RPC unavailable — static check is sufficient fallback
    }
  }

  // If both code and a deployed address are supplied, both checks must pass.
  const staticPassed = staticResult?.passed ?? false;
  const rpcPassed = rpcResult?.success ?? false;
  const hasEvidence = Boolean(code || contractAddress);
  const success =
    hasEvidence &&
    (code ? staticPassed : true) &&
    (contractAddress ? rpcPassed : true);

  const message =
    code && !staticPassed && staticResult
      ? `Code analysis failed: ${staticResult.failures.join("; ")}`
      : contractAddress && !rpcPassed
      ? rpcResult?.message ?? "Contract verification failed or RPC was unavailable."
      : rpcPassed
      ? rpcResult!.message
      : staticPassed
      ? "Code analysis passed - all required concepts found."
      : "No contract address and no code submitted.";

  if (success) {
    const { getLesson, getLessonsInGroup } = await import(
      "@/lib/curriculum/metadata"
    );
    const lesson = getLesson(lessonId);
    const groupId = lesson?.groupId ?? 1;

    await prisma.progress.upsert({
      where: {
        userId_lessonId_projectPath: { userId: user.id, lessonId, projectPath },
      },
      create: {
        userId: user.id,
        lessonId,
        projectPath,
        completed: true,
        completedAt: new Date(),
        contractAddress: contractAddress ?? null,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        ...(contractAddress ? { contractAddress } : {}),
      },
    });

    const groupLessons = getLessonsInGroup(groupId);
    const groupLessonIds = groupLessons.map((l) => l.id);

    const completedInGroup = await prisma.progress.count({
      where: {
        userId: user.id,
        projectPath,
        lessonId: { in: groupLessonIds },
        completed: true,
      },
    });

    let badgeAwarded = false;
    if (completedInGroup === groupLessons.length) {
      await prisma.badge
        .create({ data: { userId: user.id, groupId, projectPath } })
        .catch(() => {});
      badgeAwarded = true;
    }

    return NextResponse.json({
      success,
      message,
      actual: rpcResult?.actual,
      staticResult,
      badgeAwarded,
    });
  }

  return NextResponse.json({ success, message, staticResult });
}
