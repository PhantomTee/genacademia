"use client";

import { useState } from "react";
import { SuccessModal } from "./SuccessModal";

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
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    actual?: unknown;
    staticResult?: { passed: boolean; failures: string[] };
    badgeAwarded?: boolean;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const canVerify = !!contractAddress || !!code;

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

  return (
    <div className="p-4 space-y-3 font-mono">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-1">
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="0x... (optional — static analysis runs without it)"
          className="w-full px-3 py-2 bg-transparent border border-ink/20 dark:border-cream-200/20 text-sm text-ink dark:text-cream-200 placeholder-ink/30 dark:placeholder-cream-200/30 focus:outline-none focus:border-ink dark:focus:border-cream-200 transition-colors"
        />
      </div>

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
          "Verify"
        )}
      </button>

      {!contractAddress && (
        <p className="text-xs text-ink/40 dark:text-cream-200/40 leading-relaxed">
          No address? Your code will be checked for required patterns.
          Deploy first for full on-chain verification.
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
            {result.success ? "✓ Verified" : "✗ Not verified"}
          </div>
          <div className="text-ink/70 dark:text-cream-200/70 normal-case">
            {result.message}
          </div>

          {result.staticResult && (
            <div className="mt-2 space-y-1">
              <div className="text-ink/40 dark:text-cream-200/40 uppercase tracking-widest text-[10px]">
                Code analysis
              </div>
              {result.staticResult.passed ? (
                <div className="text-ink/60 dark:text-cream-200/60 normal-case">
                  ✓ All required patterns found
                </div>
              ) : (
                result.staticResult.failures.map((f, i) => (
                  <div key={i} className="text-red-400 normal-case">
                    ✗ {f}
                  </div>
                ))
              )}
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
