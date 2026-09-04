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

const jiti = jitiPackage(join(process.cwd(), "tests", "curriculum.test.mjs"), {
  interopDefault: true,
});

const { getContent } = jiti("../src/content/lessons/index.ts");
const { getSpec } = jiti("../src/lib/curriculum/specs/index.ts");
const { getEffectiveStaticChecks } = jiti("../src/lib/content/student-starter.ts");

const LESSONS = 30;
const PROJECT_PATHS = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

const lessons = {};
for (const projectPath of PROJECT_PATHS) {
  lessons[projectPath] = [];
  for (let id = 1; id <= LESSONS; id++) {
    lessons[projectPath].push(await getContent(id, projectPath));
  }
}

function codeBlocks(content) {
  return [
    ["starterCode", content.starterCode],
    ["expectedCode", content.expectedCode],
  ].filter(([, code]) => typeof code === "string" && code.length > 0);
}

for (const projectPath of PROJECT_PATHS) {
  // A class that defines __init__ twice silently discards the first body,
  // so state set up there is never initialised. 86 starters shipped this way.
  test(`${projectPath}: every contract declares one __init__`, () => {
    for (const [index, content] of lessons[projectPath].entries()) {
      for (const [field, code] of codeBlocks(content)) {
        const inits = code.match(/^ {4}def __init__\(/gm) ?? [];
        assert.ok(
          inits.length <= 1,
          `lesson ${index + 1} ${field} defines __init__ ${inits.length} times`
        );
      }
    }
  });

  test(`${projectPath}: no contract defines a method twice`, () => {
    for (const [index, content] of lessons[projectPath].entries()) {
      for (const [field, code] of codeBlocks(content)) {
        const names = [
          ...code.matchAll(/^ {4}def\s+([A-Za-z_]\w*)\s*\(/gm),
        ].map((m) => m[1]);
        const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
        assert.deepEqual(
          dupes,
          [],
          `lesson ${index + 1} ${field} defines ${dupes.join(", ")} more than once`
        );
      }
    }
  });

  // A lesson may require a method its own starter lacks - that is the method
  // the student writes. Requiring a name no contract on the path ever defines
  // is unsatisfiable, and came from parsing prose as calls.
  test(`${projectPath}: no lesson requires an undefinable method`, async () => {
    const defined = new Set();
    for (const content of lessons[projectPath]) {
      for (const [, code] of codeBlocks(content)) {
        for (const m of code.matchAll(/^\s+def\s+([A-Za-z_]\w*)\s*\(/gm)) {
          defined.add(m[1]);
        }
      }
    }

    for (const [index, content] of lessons[projectPath].entries()) {
      const spec = await getSpec(index + 1, projectPath);
      const checks = getEffectiveStaticChecks(content, spec?.staticChecks ?? {});
      const bogus = (checks.requiredMethods ?? []).filter((m) => !defined.has(m));
      assert.deepEqual(
        bogus,
        [],
        `lesson ${index + 1} requires ${bogus.join(", ")}, which no contract defines`
      );
    }
  });
}
