/**
 * Applies the initial migration SQL directly to Supabase using the pg driver.
 * Run with: node scripts/migrate.mjs
 * Requires DIRECT_URL in .env.local
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (handles # in values by looking for quoted strings)
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  // Value: strip surrounding quotes if present, preserve content as-is
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  envVars[key] = val;
}

const DIRECT_URL = envVars["DIRECT_URL"];
const DATABASE_URL = envVars["DATABASE_URL"];
if (!DIRECT_URL && !DATABASE_URL) {
  console.error("Neither DIRECT_URL nor DATABASE_URL found in .env.local");
  process.exit(1);
}

// Parse the connection string manually to handle special chars in password
// Format: postgresql://user:password@host:port/database
function parseConnectionString(connStr) {
  const withoutScheme = connStr.replace(/^postgres(ql)?:\/\//, "");
  const atIdx = withoutScheme.lastIndexOf("@");
  const credentials = withoutScheme.slice(0, atIdx);
  const hostPart = withoutScheme.slice(atIdx + 1);
  const colonIdx = credentials.indexOf(":");
  const user = credentials.slice(0, colonIdx);
  const password = credentials.slice(colonIdx + 1);
  const [hostAndPort, database] = hostPart.split("/");
  const [host, port] = hostAndPort.split(":");
  return { user, password, host, port: parseInt(port ?? "5432", 10), database, ssl: true };
}

async function tryConnect(url, label) {
  const config = parseConnectionString(url);
  console.log(`Trying ${label}: ${config.host}:${config.port}/${config.database} as ${config.user}`);
  const client = new pg.Client(config);
  await client.connect();
  return client;
}

let client;
try {
  client = await tryConnect(DIRECT_URL, "DIRECT_URL");
} catch (err) {
  console.log(`DIRECT_URL failed (${err.message}) — falling back to DATABASE_URL`);
  client = await tryConnect(DATABASE_URL, "DATABASE_URL");
}

const migrationSQL = readFileSync(
  join(__dirname, "../prisma/migrations/20260515000000_init/migration.sql"),
  "utf8"
);

const MIGRATION_TRACKING = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
  "checksum"            VARCHAR(64) NOT NULL,
  "finished_at"         TIMESTAMPTZ,
  "migration_name"      VARCHAR(255) NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMPTZ,
  "started_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
SELECT gen_random_uuid()::text, 'manual', NOW(), '20260515000000_init', 1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260515000000_init'
);
`;

try {
  console.log("Connected to Supabase.");

  await client.query("BEGIN");
  await client.query(migrationSQL);
  await client.query(MIGRATION_TRACKING);
  await client.query("COMMIT");

  console.log("Migration applied successfully.");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  if (err.message?.includes("already exists")) {
    console.log("Tables already exist — migration skipped (idempotent).");
  } else {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
} finally {
  await client.end();
}
