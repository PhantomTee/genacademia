import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const STUDIO_RPC = "https://studio.genlayer.com/api";

export async function GET() {
  const session = await getServerSession(authOptions);
  const address = session?.user?.walletAddress;
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(STUDIO_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });
    const data = await res.json() as { result?: string; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);

    const TEN18 = BigInt("1000000000000000000");
    const wei = BigInt(data.result ?? "0x0");
    const whole = wei / TEN18;
    const fracWei = wei % TEN18;
    const frac = (fracWei * BigInt(100)) / TEN18;
    const balance = frac > BigInt(0)
      ? `${whole}.${frac.toString().padStart(2, "0")}`
      : `${whole}`;

    return NextResponse.json({ balance, wei: data.result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
