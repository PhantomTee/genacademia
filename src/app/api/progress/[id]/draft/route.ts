import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson id" }, { status: 400 });
  }

  const { code } = await req.json();
  const projectPath = session.user.projectPath!;

  await prisma.progress.upsert({
    where: {
      userId_lessonId_projectPath: {
        userId: (
          await prisma.user.findUnique({
            where: { walletAddress: session.user.walletAddress },
            select: { id: true },
          })
        )!.id,
        lessonId,
        projectPath,
      },
    },
    create: {
      user: { connect: { walletAddress: session.user.walletAddress } },
      lessonId,
      projectPath,
      editorDraft: code,
      draftSavedAt: new Date(),
    },
    update: {
      editorDraft: code,
      draftSavedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
