import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_PATHS = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectPath } = await req.json();
  if (!VALID_PATHS.includes(projectPath)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
    select: { id: true, projectPath: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete all progress and badges for the OLD path before switching
  await prisma.$transaction([
    prisma.progress.deleteMany({
      where: { userId: user.id, projectPath: user.projectPath ?? "" },
    }),
    prisma.badge.deleteMany({
      where: { userId: user.id, projectPath: user.projectPath ?? "" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { projectPath: projectPath as import("@prisma/client").ProjectPath },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
