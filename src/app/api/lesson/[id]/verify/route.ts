import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runStaticVerification } from "@/lib/genlayer/static-verify";
import { runVerification } from "@/lib/genlayer/verify";
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
  const { contractAddress, code } = body as {
    contractAddress?: string;
    code?: string;
  };
  const projectPath = session.user.projectPath as ProjectPath;

  const spec = await getSpec(lessonId, projectPath);
  if (!spec) {
    return NextResponse.json({ error: "No spec for this lesson" }, { status: 404 });
  }

  if (!code?.trim()) {
    return NextResponse.json({
      success: false,
      message: "Paste or edit your code first so the checklist can inspect it.",
    });
  }

  const staticResult = runStaticVerification(code, spec.staticChecks ?? {});
  let success = staticResult.passed;
  let actual: unknown;
  let message = success
    ? `Code checklist passed with a score of ${staticResult.score}%.`
    : `Code checklist scored ${staticResult.score}%. ${
        staticResult.nextStep ?? "Review the failed checks below."
      }`;

  if (staticResult.passed && spec.method) {
    if (!contractAddress?.trim()) {
      success = false;
      message =
        "Code checklist passed, but this lesson requires a deployed contract address before it can be verified.";
    } else {
      const deployedResult = await runVerification(contractAddress, spec);
      success = deployedResult.success;
      actual = deployedResult.actual;
      message = deployedResult.success
        ? `Code checklist passed and deployed contract returned the expected result.`
        : `Code checklist passed, but deployed contract verification failed: ${deployedResult.message}`;
    }
  }

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
      actual,
      staticResult,
      badgeAwarded,
    });
  }

  return NextResponse.json({ success, message, actual, staticResult });
}
