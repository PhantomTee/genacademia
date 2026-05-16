import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  // Unlock the main curriculum after completing lesson 3
  if (lessonId >= 3) {
    res.cookies.set("ga-basics", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}
