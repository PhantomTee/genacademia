import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const STUDIO_RPC = "https://studio.genlayer.com/api";

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(STUDIO_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const json = await res.json() as { result?: unknown; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { txHash } = await req.json() as { txHash?: string };
  if (!txHash) {
    return NextResponse.json({ error: "txHash required" }, { status: 400 });
  }

  try {
    const tx = await rpcCall("eth_getTransactionByHash", [txHash]) as Record<string, unknown> | null;
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const data = tx.data as Record<string, unknown> | undefined;

    // Try every plausible location for the deployed contract address
    const candidates = [
      data?.to,
      data?.recipient,
      data?.contract_address,
      tx.to_address,
      tx.recipient,
      tx.contract_address,
    ] as (string | undefined)[];

    const ZERO = "0x0000000000000000000000000000000000000000";
    const contractAddress = candidates.find(
      (c) => typeof c === "string" && c.startsWith("0x") && c.toLowerCase() !== ZERO.toLowerCase()
    ) ?? "";

    return NextResponse.json({ contractAddress, _raw: { data } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
