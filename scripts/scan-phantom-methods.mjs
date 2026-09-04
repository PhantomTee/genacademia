import jitiPackage from "jiti";
import { register } from "tsconfig-paths";
import { join } from "node:path";
register({ baseUrl: process.cwd(), paths: { "@/*": ["src/*"] } });
const jiti = jitiPackage(join(process.cwd(), "scripts", "scan-phantom-methods.mjs"), { interopDefault: true });
const { getContent } = jiti("../src/content/lessons/index.ts");
const { getSpec } = jiti("../src/lib/curriculum/specs/index.ts");
const { getEffectiveStaticChecks } = jiti("../src/lib/content/student-starter.ts");

const PATHS = ["PREDICTION_MARKET","FREELANCE_ESCROW","DAO","DEVELOPER_REPUTATION","INSURANCE"];

// A lesson's solution is the NEXT lesson's starter; lesson 30 is its own.
// A required method absent from BOTH is one no student can ever satisfy.
const bad = [];
for (const p of PATHS) {
  for (let id = 1; id <= 30; id++) {
    const c = await getContent(id, p);
    const solution = id < 30 ? (await getContent(id + 1, p)).starterCode : c.starterCode;
    const spec = await getSpec(id, p);
    const checks = getEffectiveStaticChecks(c, spec?.staticChecks ?? {});
    const missing = (checks.requiredMethods ?? []).filter(
      (m) => !solution.includes("def " + m + "(") && !c.starterCode.includes("def " + m + "(")
    );
    if (missing.length) bad.push(String(id).padStart(2,"0") + "-" + p + ": " + missing.join(", "));
  }
}
console.log("lessons requiring methods no solution defines: " + bad.length + "/150");
console.log(bad.join(String.fromCharCode(10)));
