import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  basicsCookieOptions,
  createBasicsCompletionCookie,
  shouldUnlockBasics,
} from "@/lib/basics-gate";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
  });
  if (!user) return NextResponse.json({ completed: [] });

  const progress = await prisma.progress.findMany({
    where: { userId: user.id, projectPath: "BASICS", completed: true },
    select: { lessonId: true },
  });

  const res = NextResponse.json({ completed: progress.map((p) => p.lessonId) });

  if (progress.some((p) => shouldUnlockBasics(p.lessonId))) {
    res.cookies.set(
      "ga-basics",
      await createBasicsCompletionCookie(session.user.walletAddress),
      basicsCookieOptions()
    );
  }

  return res;
}
