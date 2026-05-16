"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SuccessModal } from "./SuccessModal";

interface SpecInfo {
  method?: string;
  humanExpected: string;
}

interface StaticCheckDetail {
  title: string;
  passed: boolean;
  message: string;
  hint?: string;
}

interface StaticResult {
  passed: boolean;
  score: number;
  failures: string[];
  checks: StaticCheckDetail[];
  passedChecks: string[];
  failedChecks: string[];
  nextStep?: string;
  warnings: string[];
}

interface Props {
  lessonId: number;
  contractAddress: string;
  code: string;
  onAddressChange: (addr: string) => void;
}

export function VerifyPanel({
  lessonId,
  contractAddress,
  code,
  onAddressChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [calling, setCalling] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    actual?: unknown;
    staticResult?: StaticResult;
    badgeAwarded?: boolean;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [specInfo, setSpecInfo] = useState<SpecInfo | null>(null);
  const [callResult, setCallResult] = useState<{
    value: unknown;
    error?: string;
  } | null>(null);

  useEffect(() => {
    setCallResult(null);
    fetch(`/api/lesson/${lessonId}/spec`)
      .then((r) => r.json())
      .then((d) => {
        if (d.humanExpected) setSpecInfo(d);
      })
      .catch(() => {});
  }, [lessonId]);

  const prevAddressRef = useRef("");

  const canVerify = !!code.trim();

  const handleCall = useCallback(async () => {
    if (!contractAddress || !specInfo?.method) return;
    setCalling(true);
    setCallResult(null);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress }),
      });
      const data = await res.json();
      if (data.error) setCallResult({ value: null, error: data.error });
      else setCallResult({ value: data.result });
    } catch {
      setCallResult({ value: null, error: "Network error" });
    } finally {
      setCalling(false);
    }
  }, [contractAddress, lessonId, specInfo?.method]);

  useEffect(() => {
    if (contractAddress && !prevAddressRef.current && specInfo?.method) {
      handleCall();
    }
    prevAddressRef.current = contractAddress;
  }, [contractAddress, specInfo?.method, handleCall]);

  async function handleVerify() {
    if (!canVerify) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: contractAddress || undefined, code }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success && !showSuccess) setShowSuccess(true);
    } catch {
      setResult({ success: false, message: "Network error during verification." });
    } finally {
      setLoading(false);
    }
  }

  function callHint(): string | null {
    if (!callResult || callResult.error) return null;
    const v = callResult.value;
    const ok = v !== null && v !== undefined && v !== "" && v !== 0;
    return ok ? "Looks correct!" : "Unexpected value - check your code.";
  }

  return (
    <div className="p-4 space-y-3 font-mono">
      {specInfo && (
        <div className="border border-ink/10 dark:border-cream-200/10 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            What will be checked
          </div>
          {specInfo.method ? (
            <div className="text-xs text-ink/70 dark:text-cream-200/70">
              Method:{" "}
              <span className="text-ink dark:text-cream-200 font-bold">
                {specInfo.method}()
              </span>
            </div>
          ) : (
            <div className="text-xs text-ink/70 dark:text-cream-200/70">
              Mode:{" "}
              <span className="text-ink dark:text-cream-200 font-bold">
                Code checklist
              </span>
            </div>
          )}
          <div className="text-xs text-ink/70 dark:text-cream-200/70">
            Expects:{" "}
            <span className="text-ink dark:text-cream-200">
              {specInfo.humanExpected}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-1">
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="0x... (optional - code checklist runs without it)"
          className="w-full px-3 py-2 bg-transparent border border-ink/20 dark:border-cream-200/20 text-sm text-ink dark:text-cream-200 placeholder-ink/30 dark:placeholder-cream-200/30 focus:outline-none focus:border-ink dark:focus:border-cream-200 transition-colors"
        />
      </div>

      {contractAddress && specInfo?.method && (
        <div className="space-y-2">
          <button
            onClick={handleCall}
            disabled={calling}
            className="w-full py-2 text-xs font-bold uppercase tracking-widest border border-ink/30 dark:border-cream-200/30 text-ink/70 dark:text-cream-200/70 hover:border-ink dark:hover:border-cream-200 hover:text-ink dark:hover:text-cream-200 disabled:opacity-30 transition-colors"
          >
            {calling ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Calling...
              </span>
            ) : (
              `Call ${specInfo.method}()`
            )}
          </button>

          {callResult && (
            <div className="p-2.5 border border-ink/10 dark:border-cream-200/10 bg-ink/3 dark:bg-cream-200/3 text-xs space-y-1">
              {callResult.error ? (
                <div className="text-red-400">Error: {callResult.error}</div>
              ) : (
                <>
                  <div className="text-ink/50 dark:text-cream-200/50">
                    Return value:{" "}
                    <span className="text-ink dark:text-cream-200 font-bold">
                      {JSON.stringify(callResult.value)}
                    </span>
                  </div>
                  {callHint() && (
                    <div
                      className={
                        callHint() === "Looks correct!"
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }
                    >
                      {callHint()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={!canVerify || loading}
        className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          "Submit Verification"
        )}
      </button>

      {!contractAddress && (
        <p className="text-xs text-ink/40 dark:text-cream-200/40 leading-relaxed">
          No address? Your code will be checked for required patterns. Deployment
          is optional for this simple verification mode.
        </p>
      )}

      {result && (
        <div
          className={`p-3 border text-xs ${
            result.success
              ? "border-ink/40 dark:border-cream-200/40 bg-ink/5 dark:bg-cream-200/5"
              : "border-red-500/40 bg-red-500/5"
          }`}
        >
          <div className="font-bold uppercase tracking-widest mb-1.5">
            {result.success ? "Verified" : "Not verified"}
          </div>
          <div className="text-ink/70 dark:text-cream-200/70 normal-case">
            {result.message}
          </div>

          {result.staticResult && (
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-ink/40 dark:text-cream-200/40 uppercase tracking-widest text-[10px]">
                    Code checklist
                  </div>
                  <div className="text-ink dark:text-cream-200 font-bold">
                    {result.staticResult.score}%
                  </div>
                </div>
                <div className="h-1.5 bg-ink/10 dark:bg-cream-200/10 overflow-hidden">
                  <div
                    className={`h-full ${
                      result.staticResult.passed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.staticResult.score}%` }}
                  />
                </div>
              </div>

              {result.staticResult.nextStep && !result.staticResult.passed && (
                <div className="p-2 border border-amber-500/30 bg-amber-500/5 text-amber-500 normal-case">
                  Next fix: {result.staticResult.nextStep}
                </div>
              )}

              <div className="space-y-1.5">
                {result.staticResult.checks.map((check, i) => (
                  <div
                    key={`${check.title}-${i}`}
                    className={`p-2 border normal-case ${
                      check.passed
                        ? "border-emerald-500/25 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div
                      className={
                        check.passed
                          ? "text-emerald-500 font-bold"
                          : "text-red-400 font-bold"
                      }
                    >
                      {check.passed ? "PASS" : "FIX"} - {check.title}
                    </div>
                    {!check.passed && (
                      <div className="mt-1 text-ink/65 dark:text-cream-200/65">
                        {check.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.actual !== undefined && (
            <div className="mt-2 text-ink/50 dark:text-cream-200/50 text-[11px] normal-case">
              Returned: {JSON.stringify(result.actual)}
            </div>
          )}
        </div>
      )}

      {showSuccess && result && (
        <SuccessModal
          lessonId={lessonId}
          badgeAwarded={result.badgeAwarded ?? false}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
