import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  const projectPath = session.user.projectPath!;

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ progress: null });

  const progress = await prisma.progress.findUnique({
    where: {
      userId_lessonId_projectPath: {
        userId: user.id,
        lessonId,
        projectPath,
      },
    },
  });

  return NextResponse.json({ progress });
}
