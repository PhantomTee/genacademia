import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGenLayerClient } from "@/lib/genlayer/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractAddress, method, args = [] } = await req.json() as {
    contractAddress?: string;
    method?: string;
    args?: unknown[];
  };

  if (!contractAddress || !method) {
    return NextResponse.json({ error: "contractAddress and method required" }, { status: 400 });
  }

  const client = getGenLayerClient();
  try {
    const result = await (client as unknown as {
      readContract: (o: { address: string; functionName: string; args: unknown[] }) => Promise<unknown>;
    }).readContract({ address: contractAddress, functionName: method, args });
    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
