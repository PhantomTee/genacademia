import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSpec } from "@/lib/curriculum/specs";
import { getGenLayerClient } from "@/lib/genlayer/client";
import type { ProjectPath } from "@/lib/curriculum/metadata";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(params.id, 10);
  const projectPath = session.user.projectPath as ProjectPath;
  const { contractAddress } = await req.json() as { contractAddress?: string };

  if (!contractAddress) {
    return NextResponse.json({ error: "contractAddress required" }, { status: 400 });
  }

  const spec = await getSpec(lessonId, projectPath);
  if (!spec) {
    return NextResponse.json({ error: "No spec for this lesson" }, { status: 404 });
  }

  const client = getGenLayerClient();
  try {
    const result = await (client as unknown as {
      readContract: (o: { address: string; functionName: string; args: unknown[] }) => Promise<unknown>;
    }).readContract({
      address: contractAddress,
      functionName: spec.method,
      args: spec.args,
    });
    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
