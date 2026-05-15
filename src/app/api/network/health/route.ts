import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NETWORK_CONFIG } from "@/lib/genlayer/constants";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const network =
    (session?.user?.networkTarget as "studionet" | "localnet") ?? "studionet";
  const config = NETWORK_CONFIG[network];

  try {
    const res = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "gen_dbg_ping",
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(3000),
    });
    return NextResponse.json({ ok: res.ok, network });
  } catch {
    return NextResponse.json({ ok: false, network });
  }
}
