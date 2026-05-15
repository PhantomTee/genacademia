import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../src/lib/curriculum/specs");

// Method names per path — to be replaced with real method names by the user
// These stubs use "get_value" as a nonEmpty check placeholder
const pathMethods = {
  PREDICTION_MARKET: "get_question",
  FREELANCE_ESCROW: "get_job_title",
  DAO: "get_description",
  DEVELOPER_REPUTATION: "get_developer_name",
  INSURANCE: "get_policy_name",
};

for (let lesson = 2; lesson <= 30; lesson++) {
  const padded = String(lesson).padStart(2, "0");
  const filePath = join(outDir, `${padded}.ts`);

  const lines = [
    `import type { LessonSpecs } from "./index";`,
    ``,
    `export const specs: LessonSpecs = {`,
  ];

  for (const [path, method] of Object.entries(pathMethods)) {
    lines.push(`  ${path}: {`);
    lines.push(`    method: "${method}",`);
    lines.push(`    args: [],`);
    lines.push(`    expectedShape: "nonEmpty",`);
    lines.push(`  },`);
  }

  lines.push(`};`);
  lines.push(``);

  writeFileSync(filePath, lines.join("\n"), "utf8");
}

console.log("Generated spec stubs for lessons 02-30.");
