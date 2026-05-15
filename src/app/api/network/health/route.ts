import { NextResponse } from "next/server";
import { NETWORK_CONFIG } from "@/lib/genlayer/constants";

export async function GET() {
  const config = NETWORK_CONFIG.studionet;

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
    return NextResponse.json({ ok: res.ok, network: "studionet" });
  } catch {
    return NextResponse.json({ ok: false, network: "studionet" });
  }
}
