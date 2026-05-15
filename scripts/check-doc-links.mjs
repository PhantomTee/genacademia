#!/usr/bin/env node
/**
 * Verify every docUrl in the curriculum resolves with a 200 status.
 * Reads docUrl values from source files via regex — no TypeScript compilation needed.
 * Run: node scripts/check-doc-links.mjs
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function extractDocUrls(filePath) {
  const src = readFileSync(filePath, "utf8");
  const urls = new Set();
  for (const m of src.matchAll(/docUrl:\s*["']([^"']+)["']/g)) {
    urls.add(m[1]);
  }
  return urls;
}

// Collect all docUrls from metadata, cheatsheet, and content lesson files
const allUrls = new Set();

const sourceFiles = [
  join(root, "src/lib/curriculum/metadata.ts"),
  join(root, "src/lib/curriculum/cheatsheet.ts"),
];

// Add lesson content files
const lessonsDir = join(root, "src/content/lessons");
for (const f of readdirSync(lessonsDir)) {
  if (f.endsWith(".ts") && f !== "index.ts") {
    sourceFiles.push(join(lessonsDir, f));
  }
}

for (const f of sourceFiles) {
  for (const url of extractDocUrls(f)) allUrls.add(url);
}

const urls = [...allUrls].sort();
console.log(`Checking ${urls.length} unique docUrls…\n`);

let failures = 0;

for (const url of urls) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "genacademia-ci/1.0" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (res.ok) {
      console.log(`  ✓  ${url}`);
    } else {
      console.error(`  ✗  ${url}  →  HTTP ${res.status}`);
      failures++;
    }
  } catch (err) {
    console.error(`  ✗  ${url}  →  ${err.message}`);
    failures++;
  }
}

console.log(`\n${failures === 0 ? "All links OK." : `${failures} link(s) failed.`}`);
process.exit(failures > 0 ? 1 : 0);
