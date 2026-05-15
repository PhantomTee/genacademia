import { getGenLayerClient } from "./client";
import type { NetworkTarget } from "./constants";

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
  spec: VerificationSpec,
  network: NetworkTarget = "studionet"
): Promise<VerificationResult> {
  const client = getGenLayerClient(network);

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
