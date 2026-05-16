import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  // Re-sync the ga-basics cookie so progress persists across sessions/cleared cookies
  if (progress.some((p) => p.lessonId >= 3)) {
    res.cookies.set("ga-basics", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}
