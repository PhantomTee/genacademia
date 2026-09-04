import { getGenLayerClient } from "./client";
import type { StaticChecks, StaticVerificationResult } from "./static-verify";

export {
  runStaticVerification,
  type StaticCheckDetail,
  type StaticChecks,
  type StaticVerificationResult,
} from "./static-verify";

export interface VerificationSpec {
  method?: string;
  args?: unknown[];
  expectedShape?: "exact" | "nonEmpty" | "custom";
  expected?: unknown;
  customCheck?: (actual: unknown) => boolean;
  /** Shown when customCheck fails, so the student knows what to do next. */
  customMessage?: string;
  staticChecks?: StaticChecks;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  actual?: unknown;
  staticResult?: StaticVerificationResult;
}

export async function runVerification(
  contractAddress: string,
  spec: VerificationSpec
): Promise<VerificationResult> {
  if (!spec.method) {
    return {
      success: false,
      message: "This lesson does not have a deployed method check yet.",
    };
  }

  const client = getGenLayerClient();

  let actual: unknown;
  try {
    actual = await (client as unknown as {
      readContract: (o: {
        address: string;
        functionName: string;
        args: unknown[];
      }) => Promise<unknown>;
    }).readContract({
      address: contractAddress,
      functionName: spec.method,
      args: spec.args ?? [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Contract call failed: ${msg}` };
  }

  if (spec.expectedShape === "exact") {
    const success = JSON.stringify(actual) === JSON.stringify(spec.expected);
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
      message: ok ? "Verified." : spec.customMessage ?? "Custom check failed.",
    };
  }

  return { success: false, message: "Unknown verification shape." };
}
