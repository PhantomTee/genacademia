import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const STUDIO_RPC = "https://studio.genlayer.com/api";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const address = session?.user?.walletAddress;
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json() as { amount?: number };
  if (!amount || amount < 1 || amount > 100 || !Number.isInteger(amount)) {
    return NextResponse.json({ error: "Amount must be an integer between 1 and 100" }, { status: 400 });
  }

  // Construct wei amount without JSON precision loss — 1 GEN = 10^18 wei
  const amountWei = BigInt(amount) * BigInt("1000000000000000000");
  const body = `{"jsonrpc":"2.0","method":"sim_fundAccount","params":["${address}",${amountWei}],"id":1}`;

  try {
    const res = await fetch(STUDIO_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json() as { result?: unknown; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
