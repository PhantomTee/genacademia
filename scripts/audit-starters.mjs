#!/usr/bin/env node
import jitiPackage from "jiti";
import { register } from "tsconfig-paths";
import { join } from "node:path";

register({
  baseUrl: process.cwd(),
  paths: { "@/*": ["src/*"] },
});

const jiti = jitiPackage(join(process.cwd(), "scripts", "audit-starters.mjs"), {
  interopDefault: true,
});

const { getContent } = jiti("../src/content/lessons/index.ts");
const { getSpec } = jiti("../src/lib/curriculum/specs/index.ts");
const { runStaticVerification } = jiti("../src/lib/genlayer/static-verify.ts");
const {
  getEffectiveStaticChecks,
  prepareLessonContentForStudent,
} = jiti("../src/lib/content/student-starter.ts");

const PROJECT_PATHS = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

const failures = [];
let redacted = 0;

for (const projectPath of PROJECT_PATHS) {
  for (let lessonId = 1; lessonId <= 30; lessonId++) {
    const rawContent = await getContent(lessonId, projectPath);
    const spec = await getSpec(lessonId, projectPath);
    const content = prepareLessonContentForStudent(rawContent, spec);
    const checks = getEffectiveStaticChecks(rawContent, spec?.staticChecks ?? {});
    const result = runStaticVerification(content.starterCode, checks);

    if (content.starterCode !== rawContent.starterCode) redacted++;
    if (result.passed) {
      failures.push({
        lessonId,
        projectPath,
        score: result.score,
      });
    }
  }
}

console.log(`Starter audit: ${PROJECT_PATHS.length * 30} lessons checked.`);
console.log(`Prepared starters redacted: ${redacted}.`);

if (failures.length > 0) {
  console.error("Starters that still pass verification before editing:");
  for (const failure of failures) {
    console.error(
      `- Lesson ${String(failure.lessonId).padStart(2, "0")} ${failure.projectPath} (${failure.score}%)`
    );
  }
  process.exit(1);
}

console.log("All prepared starters require student work before verification can pass.");
