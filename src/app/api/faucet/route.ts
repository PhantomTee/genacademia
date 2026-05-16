import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const STUDIO_RPC = "https://studio.genlayer.com/api";
const COOLDOWN_SECONDS = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const address = session?.user?.walletAddress;
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: check cookie timestamp
  const lastTs = req.cookies.get("ga-faucet-ts")?.value;
  if (lastTs) {
    const elapsed = Math.floor((Date.now() - parseInt(lastTs, 10)) / 1000);
    const remaining = COOLDOWN_SECONDS - elapsed;
    if (remaining > 0) {
      return NextResponse.json(
        { error: `Rate limited — wait ${remaining}s before requesting again.`, retryAfter: remaining },
        { status: 429 }
      );
    }
  }

  const { amount } = await req.json() as { amount?: number };
  if (!amount || amount < 1 || amount > 100 || !Number.isInteger(amount)) {
    return NextResponse.json({ error: "Amount must be an integer between 1 and 100" }, { status: 400 });
  }

  // Construct wei amount without JSON precision loss — 1 GEN = 10^18 wei
  const amountWei = BigInt(amount) * BigInt("1000000000000000000");
  const body = `{"jsonrpc":"2.0","method":"sim_fundAccount","params":["${address}",${amountWei}],"id":1}`;

  try {
    const rpcRes = await fetch(STUDIO_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await rpcRes.json() as { result?: unknown; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);

    const res = NextResponse.json({ ok: true });
    // Not httpOnly so client can read for countdown display
    res.cookies.set("ga-faucet-ts", Date.now().toString(), {
      path: "/",
      maxAge: COOLDOWN_SECONDS,
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
