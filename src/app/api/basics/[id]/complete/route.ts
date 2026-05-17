import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  basicsCookieOptions,
  createBasicsCompletionCookie,
  shouldUnlockBasics,
} from "@/lib/basics-gate";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  if (isNaN(lessonId) || lessonId < 1 || lessonId > 15) {
    return NextResponse.json({ error: "Invalid lesson id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.progress.upsert({
    where: {
      userId_lessonId_projectPath: { userId: user.id, lessonId, projectPath: "BASICS" },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: user.id,
      lessonId,
      projectPath: "BASICS",
      completed: true,
      completedAt: new Date(),
    },
  });

  const res = NextResponse.json({ ok: true });

  if (shouldUnlockBasics(lessonId)) {
    res.cookies.set(
      "ga-basics",
      await createBasicsCompletionCookie(session.user.walletAddress),
      basicsCookieOptions()
    );
  }

  return res;
}
