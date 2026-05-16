import { getGenLayerClient } from "./client";

export interface StaticChecks {
  requiredClass?: string;
  requiredMethods?: string[];
  requiredDecorators?: string[];
  requiredConcepts?: string[];
  forbiddenPatterns?: string[];
}

export interface VerificationSpec {
  method: string;
  args: unknown[];
  expectedShape: "exact" | "nonEmpty" | "custom";
  expected?: unknown;
  customCheck?: (actual: unknown) => boolean;
  staticChecks?: StaticChecks;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  actual?: unknown;
  staticResult?: { passed: boolean; failures: string[] };
}

export function runStaticVerification(
  code: string,
  checks: StaticChecks
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  const lines = code.split(/\r?\n/);
  const firstLine = lines[0] ?? "";

  if (!/^#\s*\{\s*"Depends"\s*:\s*"py-genlayer:[^"]+"\s*\}\s*$/.test(firstLine)) {
    failures.push('Line 1 must be the GenLayer dependency header: `# { "Depends": "py-genlayer:HASH" }`');
  }

  if (firstLine.includes("py-genlayer:test")) {
    failures.push("Dependency header still uses the placeholder `py-genlayer:test` hash");
  }

  if (!/^\s*from\s+genlayer\s+import\s+\*\s*$/m.test(code)) {
    failures.push("Missing official GenLayer import: `from genlayer import *`");
  }

  const contractClasses = code.match(/^\s*class\s+\w+\s*\(\s*gl\.Contract\s*\)\s*:/gm) ?? [];
  if (contractClasses.length === 0) {
    failures.push("Missing a class that extends `gl.Contract`");
  } else if (contractClasses.length > 1) {
    failures.push("Only one class may extend `gl.Contract` in a contract file");
  }

  const obsoletePatterns = [
    "gl.eq_principle_strict_eq",
    "gl.eq_principle_prompt_comparative",
    "gl.message.recipient_address.transfer",
    "gl.send(",
  ];
  for (const pattern of obsoletePatterns) {
    if (code.includes(pattern)) {
      failures.push(`Obsolete GenLayer API found: \`${pattern}\``);
    }
  }

  if (/\bgl\.message\.sender\b/.test(code)) {
    failures.push("Use `gl.message.sender_address`, not `gl.message.sender`");
  }

  if (
    /gl\.nondet\.(exec_prompt|web\.)/.test(code) &&
    !code.includes("gl.vm.run_nondet_unsafe")
  ) {
    failures.push("Non-deterministic calls must run inside `gl.vm.run_nondet_unsafe(leader, validator)`");
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const method = line.match(/^    def\s+([A-Za-z_]\w*)\s*\((.*)$/);
    if (!method || method[1] === "__init__") continue;

    let previous = i - 1;
    while (previous >= 0 && lines[previous].trim() === "") previous--;
    const decorator = lines[previous]?.trim() ?? "";
    if (decorator.startsWith("@gl.public.") && !/\)\s*->\s*[^:]+:/.test(line)) {
      failures.push(`Public contract method \`${method[1]}\` is missing a return type annotation`);
    }
  }

  if (checks.requiredClass) {
    if (!code.includes(`class ${checks.requiredClass}`)) {
      failures.push(`Missing class \`${checks.requiredClass}\``);
    }
  }

  for (const method of checks.requiredMethods ?? []) {
    if (!code.includes(`def ${method}`)) {
      failures.push(`Missing method \`${method}\``);
    }
  }

  for (const decorator of checks.requiredDecorators ?? []) {
    if (!code.includes(decorator)) {
      failures.push(`Missing decorator \`${decorator}\``);
    }
  }

  for (const concept of checks.requiredConcepts ?? []) {
    if (!code.includes(concept)) {
      failures.push(`Missing required concept: \`${concept}\``);
    }
  }

  for (const pattern of checks.forbiddenPatterns ?? []) {
    if (code.includes(pattern)) {
      failures.push(`Forbidden pattern found: \`${pattern}\``);
    }
  }

  return { passed: failures.length === 0, failures };
}

export async function runVerification(
  contractAddress: string,
  spec: VerificationSpec
): Promise<VerificationResult> {
  const client = getGenLayerClient();

  let actual: unknown;
  try {
    actual = await (client as unknown as { readContract: (o: { address: string; functionName: string; args: unknown[] }) => Promise<unknown> }).readContract({
      address: contractAddress,
      functionName: spec.method,
      args: spec.args,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Contract call failed: ${msg}` };
  }

  if (spec.expectedShape === "exact") {
    const success =
      JSON.stringify(actual) === JSON.stringify(spec.expected);
    return {
      success,
      actual,
      message: success
        ? "Verified."
        : `Expected ${JSON.stringify(spec.expected)} but got ${JSON.stringify(actual)}.`,
    };
  }

  if (spec.expectedShape === "nonEmpty") {
    const success =
      actual !== null && actual !== undefined && actual !== "" && actual !== 0;
    return {
      success,
      actual,
      message: success ? "Verified." : "Method returned empty or null.",
    };
  }

  if (spec.expectedShape === "custom" && spec.customCheck) {
    const ok = spec.customCheck(actual);
    return {
      success: ok,
      actual,
      message: ok ? "Verified." : "Custom check failed.",
    };
  }

  return { success: false, message: "Unknown verification shape." };
}
