import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  const { txHash, contractAddress } = await req.json();
  const projectPath = session.user.projectPath!;

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.progress.upsert({
    where: {
      userId_lessonId_projectPath: {
        userId: user.id,
        lessonId,
        projectPath,
      },
    },
    create: {
      userId: user.id,
      lessonId,
      projectPath,
      txHash,
      contractAddress,
    },
    update: { txHash, contractAddress },
  });

  return NextResponse.json({ ok: true });
}
