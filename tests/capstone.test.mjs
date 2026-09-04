#!/usr/bin/env node
import test from "node:test";
import assert from "node:assert/strict";
import jitiPackage from "jiti";
import { register } from "tsconfig-paths";
import { join } from "node:path";

register({
  baseUrl: process.cwd(),
  paths: { "@/*": ["src/*"] },
});

const jiti = jitiPackage(join(process.cwd(), "tests", "capstone.test.mjs"), {
  interopDefault: true,
});

const { getContent } = jiti("../src/content/lessons/index.ts");
const { getSpec } = jiti("../src/lib/curriculum/specs/index.ts");
const { runStaticVerification } = jiti("../src/lib/genlayer/static-verify.ts");
const { getEffectiveStaticChecks } = jiti("../src/lib/content/student-starter.ts");

const CAPSTONE = 30;
const PROJECT_PATHS = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

const loaded = {};
for (const projectPath of PROJECT_PATHS) {
  loaded[projectPath] = {
    content: await getContent(CAPSTONE, projectPath),
    spec: await getSpec(CAPSTONE, projectPath),
  };
}

function defNames(code) {
  return [...code.matchAll(/^ {4}def\s+([A-Za-z_]\w*)\s*\(/gm)].map((m) => m[1]);
}

for (const projectPath of PROJECT_PATHS) {
  const { content, spec } = loaded[projectPath];
  const code = content.starterCode;

  // The reference solution must satisfy everything we demand of a student.
  // This is what fails if a capstone stops implementing a claimed workflow.
  test(`${projectPath}: capstone starter satisfies its own spec`, () => {
    const checks = getEffectiveStaticChecks(content, spec.staticChecks ?? {});
    const result = runStaticVerification(code, checks);
    assert.equal(
      result.passed,
      true,
      `failed checks: ${result.failedChecks.join(", ")}`
    );
  });

  // State: an index that is iterated but never appended to always reads empty,
  // which is the bug that made the list views return [] on three paths.
  test(`${projectPath}: every id index is appended to and read back`, () => {
    const indexes = [...code.matchAll(/^ {4}([a-z_]+_ids)\s*:\s*DynArray/gm)].map(
      (m) => m[1]
    );
    assert.ok(indexes.length > 0, "capstone declares no id index");

    for (const field of indexes) {
      assert.ok(
        code.includes("self." + field + ".append("),
        `${field} is never appended to, so views over it always return []`
      );
      assert.ok(
        code.includes("in self." + field),
        `${field} is never iterated, so nothing reads the index`
      );
    }
  });

  // A second __init__ silently overrides the first and drops its state setup.
  test(`${projectPath}: declares exactly one __init__`, () => {
    const inits = code.match(/^ {4}def __init__\(/gm) ?? [];
    assert.equal(inits.length, 1, `found ${inits.length} __init__ methods`);
  });

  test(`${projectPath}: defines no duplicate methods`, () => {
    const names = defNames(code);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    assert.deepEqual([...new Set(dupes)], [], "duplicate method definitions");
  });

  // Value: anything that can receive GEN must actually look at what it received.
  test(`${projectPath}: payable methods read gl.message.value`, () => {
    const payable = [
      ...code.matchAll(
        /@gl\.public\.write\.payable\s*\n\s*def\s+([A-Za-z_]\w*)\s*\(/g
      ),
    ].map((m) => m[1]);

    for (const method of payable) {
      const body = code.slice(code.indexOf(`def ${method}(`));
      const nextDef = body.indexOf("\n    def ", 1);
      const scoped = nextDef > 0 ? body.slice(0, nextDef) : body;
      assert.match(
        scoped,
        /gl\.message\.value/,
        `${method} is payable but never reads gl.message.value`
      );
    }
  });

  // The deployed check must exercise the index view, not an identity getter.
  test(`${projectPath}: deployed check targets an index view`, () => {
    assert.equal(spec.expectedShape, "custom");
    assert.equal(typeof spec.customCheck, "function");
    assert.match(
      spec.method,
      /^get_all_\w+_json$/,
      `deployed check reads ${spec.method}, which does not exercise stored state`
    );
    assert.ok(
      defNames(code).includes(spec.method),
      `${spec.method} is not defined in the capstone contract`
    );
  });

  // Regression guard: a non-empty identity string used to be enough to pass,
  // and an index that was never appended to still reads as [].
  test(`${projectPath}: deployed check requires real stored state`, () => {
    const { customCheck } = spec;
    assert.equal(
      customCheck("[]"),
      false,
      "an empty index means nothing was ever stored"
    );
    assert.equal(
      customCheck('[{"id":"0","status":"open"}]'),
      true,
      "populated index should pass"
    );
    assert.equal(
      customCheck(JSON.stringify(spec.staticChecks.requiredClass)),
      false,
      "a bare contract name must not pass"
    );
    assert.equal(customCheck("PredictX"), false, "unparseable output must fail");
    assert.equal(customCheck(""), false, "empty output must fail");
  });

  test(`${projectPath}: empty-index failure is actionable`, () => {
    assert.equal(typeof spec.customMessage, "string");
    assert.match(spec.customMessage, /verify again/);
  });
}
