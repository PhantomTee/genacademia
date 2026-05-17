import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_NONCES_PER_WINDOW = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: NextRequest, address: string) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || req.headers.get("x-real-ip") || "unknown";
  return `${ip}:${address.toLowerCase()}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_NONCES_PER_WINDOW;
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "valid address required" }, { status: 400 });
  }

  if (isRateLimited(getClientKey(req, address))) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const nonce = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.authNonce.deleteMany({
    where: {
      address: { equals: address, mode: "insensitive" },
      usedAt: null,
      expiresAt: { lt: new Date() },
    },
  });

  await prisma.authNonce.create({
    data: { address, nonce, expiresAt },
  });

  return NextResponse.json({ nonce });
}
