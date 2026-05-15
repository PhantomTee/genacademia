import { writeFileSync } from "fs";
import { join } from "path";

const specsDir = join(
  import.meta.dirname,
  "../src/lib/curriculum/specs"
);

// Per-path primary identifiers (class name + primary view method)
const PATHS = {
  PREDICTION_MARKET: { class: "PredictionMarket", method: "get_question" },
  FREELANCE_ESCROW:  { class: "FreelanceEscrow",  method: "get_title"    },
  DAO:               { class: "GovernanceDAO",     method: "get_name"     },
  DEVELOPER_REPUTATION: { class: "DeveloperReputation", method: "get_registry_name" },
  INSURANCE:         { class: "InsurancePool",     method: "get_pool_name"},
};

const PATH_KEYS = Object.keys(PATHS);

// Per-lesson static checks (shared across all paths for each lesson)
const LESSON_CHECKS = {
  1:  { requiredDecorators: ["@gl.public.view"] },
  2:  { requiredDecorators: ["@gl.public.write"], requiredConcepts: ["gl.message.sender_address"] },
  3:  { requiredConcepts: ["gl.vm.UserError", "raise"] },
  4:  { requiredConcepts: ["Address"] },
  5:  { requiredDecorators: ["@gl.public.view", "@gl.public.write"], requiredConcepts: ["gl.vm.UserError", "Address"] },
  6:  { requiredConcepts: ["exec_prompt"] },
  7:  { requiredConcepts: ["exec_prompt", "response_format"] },
  8:  { requiredConcepts: ["exec_prompt"] },
  9:  { requiredConcepts: ["web.get"] },
  10: { requiredConcepts: ["exec_prompt", "web.get"] },
  11: { requiredConcepts: ["TreeMap"] },
  12: { requiredConcepts: ["@dataclass"] },
  13: { requiredConcepts: ["Address", "sender_address"] },
  14: { requiredConcepts: ["status"], requiredDecorators: ["@gl.public.view"] },
  15: { requiredConcepts: ["TreeMap", "status", "Address"] },
  16: { requiredConcepts: ["run_nondet_unsafe"] },
  17: { requiredConcepts: ["run_nondet_unsafe"] },
  18: { requiredConcepts: ["web.render"] },
  19: { requiredConcepts: ["images="] },
  20: { requiredConcepts: ["exec_prompt", "run_nondet_unsafe"] },
  21: { requiredDecorators: ["@gl.public.write.payable"], requiredConcepts: ["gl.message.value"] },
  22: { requiredConcepts: ["gl.send"] },
  23: { requiredConcepts: ["VectorStorage"] },
  24: { requiredConcepts: ["call_contract"] },
  25: { requiredDecorators: ["@gl.public.write.payable"], requiredConcepts: ["gl.send"] },
  26: { requiredConcepts: ["get_random"] },
  27: { requiredConcepts: ["owner"] },
  28: { requiredConcepts: ["emit_debug"] },
  29: { requiredConcepts: ["__receive_"] },
  30: { requiredConcepts: ["exec_prompt", "gl.send"] },
};

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
