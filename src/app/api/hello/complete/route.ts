import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.progress.upsert({
    where: { userId_lessonId_projectPath: { userId: user.id, lessonId: 0, projectPath: "HELLO" } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: user.id, lessonId: 0, projectPath: "HELLO", completed: true, completedAt: new Date() },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ga-hello", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
