import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Must run per-request: a cached "ok" would keep claiming the database is up
// long after it went down.
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 4000;
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db timeout")), TIMEOUT_MS)
      ),
    ]);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    // 503 rather than 500: this is a dependency being unavailable, and it is
    // the signal the sign-in banner polls for.
    return NextResponse.json({ ok: false }, { status: 503, headers: noStore });
  }
}
