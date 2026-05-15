import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHumanSpec } from "@/lib/curriculum/specs";
import type { ProjectPath } from "@/lib/curriculum/metadata";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  const projectPath = session.user.projectPath as ProjectPath;

  const spec = await getHumanSpec(lessonId, projectPath);
  if (!spec) {
    return NextResponse.json({ error: "No spec for this lesson" }, { status: 404 });
  }

  return NextResponse.json(spec);
}
