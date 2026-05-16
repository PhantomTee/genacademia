export interface StaticChecks {
  requiredClass?: string;
  requiredMethods?: string[];
  requiredDecorators?: string[];
  requiredConcepts?: string[];
  requiredStrings?: string[];
  requiredMethodDecorators?: {
    method: string;
    decorator: string;
    hint?: string;
  }[];
  forbiddenPatterns?: string[];
}

export interface StaticCheckDetail {
  title: string;
  passed: boolean;
  message: string;
  hint?: string;
}

export interface StaticVerificationResult {
  passed: boolean;
  score: number;
  checks: StaticCheckDetail[];
  passedChecks: string[];
  failedChecks: string[];
  failures: string[];
  nextStep?: string;
  warnings: string[];
}

function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "");
}

function containsCode(code: string, needle: string): boolean {
  return code.includes(needle) || normalizeCode(code).includes(normalizeCode(needle));
}

function hasMethod(code: string, method: string): boolean {
  return new RegExp(`\\bdef\\s+${method}\\s*\\(`).test(code);
}

function methodHasDecorator(code: string, method: string, decorator: string): boolean {
  const lines = code.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    if (!new RegExp(`^\\s*def\\s+${method}\\s*\\(`).test(lines[i])) continue;

    let previous = i - 1;
    while (previous >= 0 && lines[previous].trim() === "") previous--;
    return lines[previous]?.trim() === decorator;
  }

  return false;
}

export function runStaticVerification(
  code: string,
  checks: StaticChecks
): StaticVerificationResult {
  const checklist: StaticCheckDetail[] = [];
  const warnings: string[] = [];
  const lines = code.split(/\r?\n/);
  const firstLine = lines[0] ?? "";

  function addCheck(
    title: string,
    passed: boolean,
    message: string,
    hint?: string
  ) {
    checklist.push({ title, passed, message, hint });
  }

  addCheck(
    "GenLayer dependency header",
    /^#\s*\{\s*"Depends"\s*:\s*"py-genlayer:[^"]+"\s*\}\s*$/.test(firstLine) &&
      !firstLine.includes("py-genlayer:test"),
    'Line 1 must be the GenLayer dependency header: `# { "Depends": "py-genlayer:HASH" }`',
    "Keep the dependency header as the first line and use the real py-genlayer hash."
  );

  addCheck(
    "Official GenLayer import",
    /^\s*from\s+genlayer\s+import\s+\*\s*$/m.test(code),
    "Missing official GenLayer import: `from genlayer import *`",
    "Add `from genlayer import *` near the top of the contract."
  );

  const contractClasses = code.match(/^\s*class\s+\w+\s*\(\s*gl\.Contract\s*\)\s*:/gm) ?? [];
  addCheck(
    "Single GenLayer contract class",
    contractClasses.length === 1,
    contractClasses.length === 0
      ? "Missing a class that extends `gl.Contract`"
      : "Only one class may extend `gl.Contract` in a contract file",
    "Define one contract class with `class Name(gl.Contract):`."
  );

  const obsoletePatterns = [
    "gl.eq_principle_strict_eq",
    "gl.eq_principle_prompt_comparative",
    "gl.message.recipient_address.transfer",
    "gl.send(",
  ];
  const obsoleteFound = obsoletePatterns.filter((pattern) => code.includes(pattern));
  if (/\bgl\.message\.sender\b/.test(code)) {
    obsoleteFound.push("gl.message.sender");
  }
  addCheck(
    "Current GenLayer APIs",
    obsoleteFound.length === 0,
    `Obsolete GenLayer API found: ${obsoleteFound.map((pattern) => `\`${pattern}\``).join(", ")}`,
    "Use current APIs such as `gl.message.sender_address` and documented transfer patterns."
  );

  addCheck(
    "No placeholder code",
    !/\b(TODO|NotImplementedError|stub|placeholder)\b|^\s*pass\s*$/im.test(code),
    "Placeholder code is still present.",
    "Replace placeholder text or `pass` statements with the real lesson logic."
  );

  addCheck(
    "Safe nondeterministic calls",
    !/gl\.nondet\.(exec_prompt|web\.)/.test(code) ||
      code.includes("gl.vm.run_nondet_unsafe"),
    "Non-deterministic calls must run inside `gl.vm.run_nondet_unsafe(leader, validator)`",
    "Wrap AI/web nondeterministic work with a leader and validator function."
  );

  const missingReturnAnnotations: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const method = line.match(/^    def\s+([A-Za-z_]\w*)\s*\((.*)$/);
    if (!method || method[1] === "__init__") continue;

    let previous = i - 1;
    while (previous >= 0 && lines[previous].trim() === "") previous--;
    const decorator = lines[previous]?.trim() ?? "";
    if (decorator.startsWith("@gl.public.") && !/\)\s*->\s*[^:]+:/.test(line)) {
      missingReturnAnnotations.push(method[1]);
    }
  }
  addCheck(
    "Public method return types",
    missingReturnAnnotations.length === 0,
    `Public contract methods missing return type annotations: ${missingReturnAnnotations.join(", ")}`,
    "Add `-> str`, `-> None`, or the correct return type to each public method."
  );

  if (checks.requiredClass) {
    addCheck(
      `Class ${checks.requiredClass}`,
      new RegExp(`\\bclass\\s+${checks.requiredClass}\\s*\\(\\s*gl\\.Contract\\s*\\)\\s*:`).test(code),
      `Missing class \`${checks.requiredClass}\``,
      `Name the contract class \`${checks.requiredClass}\` and extend \`gl.Contract\`.`
    );
  }

  for (const method of checks.requiredMethods ?? []) {
    addCheck(
      `Method ${method}`,
      hasMethod(code, method),
      `Missing method \`${method}\``,
      `Add \`def ${method}(...):\` to the contract.`
    );
  }

  for (const decorator of checks.requiredDecorators ?? []) {
    addCheck(
      `Decorator ${decorator}`,
      code.includes(decorator),
      `Missing decorator \`${decorator}\``,
      `Place \`${decorator}\` directly above the method that needs it.`
    );
  }

  for (const methodCheck of checks.requiredMethodDecorators ?? []) {
    addCheck(
      `${methodCheck.method} uses ${methodCheck.decorator}`,
      methodHasDecorator(code, methodCheck.method, methodCheck.decorator),
      `Method \`${methodCheck.method}\` must use \`${methodCheck.decorator}\``,
      methodCheck.hint ?? `Place \`${methodCheck.decorator}\` directly above \`def ${methodCheck.method}\`.`
    );
  }

  for (const concept of checks.requiredConcepts ?? []) {
    addCheck(
      `Concept ${concept}`,
      containsCode(code, concept),
      `Missing required concept: \`${concept}\``,
      `Add or keep this required code pattern: \`${concept}\`.`
    );
  }

  for (const requiredString of checks.requiredStrings ?? []) {
    addCheck(
      `Text ${requiredString}`,
      code.includes(requiredString),
      `Missing required text: \`${requiredString}\``,
      `Use the exact lesson text: \`${requiredString}\`.`
    );
  }

  for (const pattern of obsoletePatterns) {
    if (code.includes(pattern)) {
      warnings.push(`Obsolete GenLayer API found: \`${pattern}\``);
    }
  }

  if (/\bgl\.message\.sender\b/.test(code)) {
    warnings.push("Use `gl.message.sender_address`, not `gl.message.sender`");
  }

  for (const pattern of checks.forbiddenPatterns ?? []) {
    if (code.includes(pattern)) {
      checklist.push({
        title: `Avoid ${pattern}`,
        passed: false,
        message: `Forbidden pattern found: \`${pattern}\``,
        hint: `Remove \`${pattern}\` from the solution.`,
      });
    } else {
      checklist.push({
        title: `Avoid ${pattern}`,
        passed: true,
        message: `Forbidden pattern not present: \`${pattern}\``,
      });
    }
  }

  const failures = checklist
    .filter((check) => !check.passed)
    .map((check) => check.message);
  const passedChecks = checklist
    .filter((check) => check.passed)
    .map((check) => check.title);
  const failedChecks = checklist
    .filter((check) => !check.passed)
    .map((check) => check.title);
  const score =
    checklist.length === 0
      ? 100
      : Math.round((passedChecks.length / checklist.length) * 100);

  return {
    passed: failures.length === 0,
    score,
    checks: checklist,
    passedChecks,
    failedChecks,
    failures,
    nextStep: checklist.find((check) => !check.passed)?.hint,
    warnings,
  };
}
