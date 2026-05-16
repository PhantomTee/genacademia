import { writeFileSync } from "fs";
import { join } from "path";

const specsDir = join(
  import.meta.dirname,
  "../src/lib/curriculum/specs"
);

// Per-path primary identifiers (class name + primary view method)
const PATHS = {
  PREDICTION_MARKET: { class: "PredictX", method: "get_platform_name" },
  FREELANCE_ESCROW:  { class: "TrustLance",  method: "get_platform_name"    },
  DAO:               { class: "GovMind",     method: "get_dao_name"     },
  DEVELOPER_REPUTATION: { class: "CodeVault", method: "get_platform_name" },
  INSURANCE:         { class: "CaseWise",     method: "get_court_name"},
};

const PATH_KEYS = Object.keys(PATHS);

// Per-lesson checks stay intentionally narrow. GenLayer API conformance is now
// enforced centrally in runStaticVerification, while each generated spec only
// pins the expected class name for the selected project track.
const LESSON_CHECKS = Object.fromEntries(
  Array.from({ length: 30 }, (_, index) => [index + 1, {}])
);

for (let lesson = 1; lesson <= 30; lesson++) {
  const checks = LESSON_CHECKS[lesson];

  const entries = PATH_KEYS.map((path) => {
    const { class: cls, method } = PATHS[path];
    const staticChecksLines = [];
    staticChecksLines.push(`      requiredClass: "${cls}",`);
    if (checks.requiredDecorators) {
      const arr = checks.requiredDecorators.map(d => `"${d}"`).join(", ");
      staticChecksLines.push(`      requiredDecorators: [${arr}],`);
    }
    if (checks.requiredConcepts) {
      const arr = checks.requiredConcepts.map(c => `"${c}"`).join(", ");
      staticChecksLines.push(`      requiredConcepts: [${arr}],`);
    }

    return `  ${path}: {
    method: "${method}",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
${staticChecksLines.join("\n")}
    },
  },`;
  });

  const content = `import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
${entries.join("\n")}
};
`;

  const filename = join(specsDir, `${String(lesson).padStart(2, "0")}.ts`);
  writeFileSync(filename, content, "utf8");
  console.log(`Wrote ${filename}`);
}

console.log("Done — 30 spec files written.");
