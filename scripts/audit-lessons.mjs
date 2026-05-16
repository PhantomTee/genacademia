#!/usr/bin/env node
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const lessonsDir = join(process.cwd(), "src", "content", "lessons");
const files = readdirSync(lessonsDir)
  .filter((file) => /^lesson-.*\.ts$/.test(file))
  .sort();

function templateBlock(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\x60([\\s\\S]*?)\\x60`));
  return match ? match[1] : null;
}

function classify(file) {
  const source = readFileSync(join(lessonsDir, file), "utf8");
  const task = templateBlock(source, "task");
  const starterCode = templateBlock(source, "starterCode");
  const expectedCode = templateBlock(source, "expectedCode");
  const explanation = templateBlock(source, "explanation") ?? "";
  const hints = source.match(/hints:\s*\[([\s\S]*?)\]\s*,/)?.[1] ?? "";

  const placeholderTerms = [
    "TODO",
    "placeholder",
    "Continue building your contract",
    "task: ``",
    "Thought for",
    "Tell Claude",
    "Final expected platform verification",
  ];

  const reasons = [];
  const hasBlankTask = !task || task.trim().length === 0;
  const hasStarterCode = Boolean(starterCode && starterCode.trim().length > 0);
  const hasExpectedCode = Boolean(expectedCode && expectedCode.trim().length > 0);
  const hasStubLanguage = /\bstub\b/i.test(
    [explanation, task ?? "", expectedCode ?? "", hints].join("\n")
  );
  const placeholders = placeholderTerms.filter((term) => source.includes(term));

  if (!hasStarterCode) reasons.push("missing starterCode");
  if (hasBlankTask) reasons.push("blank task");
  if (hasStubLanguage) reasons.push("stub language");
  if (placeholders.length > 0) {
    reasons.push(`placeholder/chat artifact: ${placeholders.join(", ")}`);
  }
  if (!hasExpectedCode) reasons.push("no expectedCode");

  let status = "complete";
  if (!hasStarterCode || hasBlankTask || placeholders.length > 0) {
    status = "blank";
  } else if (hasStubLanguage || !hasExpectedCode) {
    status = "scaffolded";
  }

  return {
    file,
    status,
    hasStarterCode,
    hasExpectedCode,
    taskLength: task?.trim().length ?? 0,
    reasons,
  };
}

const rows = files.map(classify);
const summary = rows.reduce(
  (acc, row) => {
    acc[row.status] += 1;
    return acc;
  },
  { complete: 0, scaffolded: 0, blank: 0 }
);

console.log(`Lessons audited: ${rows.length}`);
console.log(`Complete: ${summary.complete}`);
console.log(`Scaffolded: ${summary.scaffolded}`);
console.log(`Blank: ${summary.blank}`);
console.log("");
console.log("| Status | Lesson File | Notes |");
console.log("| --- | --- | --- |");

for (const row of rows) {
  const notes = row.reasons.length > 0 ? row.reasons.join("; ") : "expectedCode present";
  console.log(`| ${row.status} | ${row.file} | ${notes} |`);
}

const hardFailures = rows.filter(
  (row) =>
    row.status === "blank" ||
    row.reasons.some((reason) => reason.startsWith("placeholder/chat artifact"))
);

if (hardFailures.length > 0) {
  console.error("");
  console.error("Hard lesson audit failures:");
  for (const row of hardFailures) {
    console.error(`- ${row.file}: ${row.reasons.join("; ")}`);
  }
  process.exit(1);
}
