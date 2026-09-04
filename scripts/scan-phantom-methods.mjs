import jitiPackage from "jiti";
import { register } from "tsconfig-paths";
import { join } from "node:path";
register({ baseUrl: process.cwd(), paths: { "@/*": ["src/*"] } });
const jiti = jitiPackage(join(process.cwd(), "scripts", "scan-phantom-methods.mjs"), { interopDefault: true });
const { getContent } = jiti("../src/content/lessons/index.ts");
const { getSpec } = jiti("../src/lib/curriculum/specs/index.ts");
const { getEffectiveStaticChecks } = jiti("../src/lib/content/student-starter.ts");

const PATHS = ["PREDICTION_MARKET","FREELANCE_ESCROW","DAO","DEVELOPER_REPUTATION","INSURANCE"];
const NL = String.fromCharCode(10);

// A lesson may legitimately require a method its own starter lacks - that is
// the method the student is there to write. What is never legitimate is
// requiring a name no contract on the path ever defines, which is what
// happens when prose is parsed as a call ("the real hash (not :test)").
const phantom = [];
for (const p of PATHS) {
  const defined = new Set();
  const lessons = [];
  for (let id = 1; id <= 30; id++) {
    const c = await getContent(id, p);
    lessons.push(c);
    // Nested defs count too: the AI lessons require an inner `def run():`.
    for (const m of c.starterCode.matchAll(/^\s+def\s+([A-Za-z_]\w*)\s*\(/gm)) {
      defined.add(m[1]);
    }
  }

  for (let id = 1; id <= 30; id++) {
    const c = lessons[id - 1];
    const spec = await getSpec(id, p);
    const checks = getEffectiveStaticChecks(c, spec?.staticChecks ?? {});
    const bogus = (checks.requiredMethods ?? []).filter((m) => !defined.has(m));
    if (bogus.length) {
      phantom.push(String(id).padStart(2, "0") + "-" + p + ": " + bogus.join(", "));
    }
  }
}

console.log("lessons requiring a method no contract on the path defines: " + phantom.length + "/150");
if (phantom.length) console.log(phantom.join(NL));
process.exit(phantom.length > 0 ? 1 : 0);
