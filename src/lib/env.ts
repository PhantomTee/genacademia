const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  STUDIONET_RPC:
    process.env.NEXT_PUBLIC_STUDIONET_RPC ?? "https://studio.genlayer.com/api",
  LOCALNET_RPC:
    process.env.NEXT_PUBLIC_LOCALNET_RPC ?? "http://localhost:4000/api",
} as const;
