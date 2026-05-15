import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { experienceLevel, projectPath, networkTarget } = body;

  const data: Record<string, string> = {};
  if (experienceLevel) data.experienceLevel = experienceLevel;
  if (projectPath) data.projectPath = projectPath;
  if (networkTarget) data.networkTarget = networkTarget;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { walletAddress: session.user.walletAddress },
    data,
  });

  return NextResponse.json({ ok: true, user });
}
