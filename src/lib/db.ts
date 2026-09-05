import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// pg's URL parser breaks on # in passwords. Parse manually into a config object.
function parseDbUrl(url: string): pg.PoolConfig {
  const withoutScheme = url.replace(/^postgres(ql)?:\/\//, "");
  const atIdx = withoutScheme.lastIndexOf("@");
  const credentials = withoutScheme.slice(0, atIdx);
  const hostPart = withoutScheme.slice(atIdx + 1);
  const colonIdx = credentials.indexOf(":");
  const user = decodeURIComponent(credentials.slice(0, colonIdx));
  const password = decodeURIComponent(credentials.slice(colonIdx + 1));
  const slashIdx = hostPart.indexOf("/");
  const hostAndPort = hostPart.slice(0, slashIdx);
  const database = hostPart.slice(slashIdx + 1).split("?")[0];
  const [host, portStr] = hostAndPort.split(":");
  return { user, password, host, port: parseInt(portStr ?? "5432", 10), database, ssl: { rejectUnauthorized: false } };
}

function createPrismaClient() {
  // Vercel's Supabase integration provides POSTGRES_URL; prefer it so a
  // database connected through the dashboard works without hand-copying
  // secrets. DATABASE_URL stays supported for local .env files.
  const rawUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("POSTGRES_URL or DATABASE_URL must be set");
  const config = parseDbUrl(rawUrl);
  const pool = new pg.Pool(config);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
