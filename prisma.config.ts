import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  // The runtime connection comes from the driver adapter in src/lib/db.ts, so
  // the schema has no url of its own and migrate commands cannot find one.
  // Migrations need the direct connection: DDL and advisory locks do not work
  // through the transaction pooler that DATABASE_URL points at.
  datasource: {
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.DIRECT_URL ??
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL,
  },
});
