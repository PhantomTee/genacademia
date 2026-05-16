"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = [
  { value: "PREDICTION_MARKET", label: "PredictX" },
  { value: "FREELANCE_ESCROW", label: "TrustLance" },
  { value: "DAO", label: "GovMind" },
  { value: "DEVELOPER_REPUTATION", label: "CodeVault" },
  { value: "INSURANCE", label: "CaseWise" },
] as const;

export function PathSwitcher({ currentPath }: { currentPath: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  function handleSelect(value: string) {
    if (value === currentPath) return;
    setPendingPath(value);
    setShowConfirm(true);
  }

  async function confirmSwitch() {
    if (!pendingPath) return;
    setLoading(true);
    setShowConfirm(false);
    await fetch("/api/user/path", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectPath: pendingPath }),
    });
    setLoading(false);
    router.refresh();
  }

  const pendingLabel = PATHS.find((p) => p.value === pendingPath)?.label;

  return (
    <>
      <select
        value={currentPath}
        disabled={loading}
        onChange={(e) => handleSelect(e.target.value)}
        className="text-xs font-bold uppercase tracking-widest px-3 py-2 border border-ink/30 dark:border-cream-200/30 bg-transparent text-ink dark:text-cream-200 focus:outline-none focus:border-ink dark:focus:border-cream-200 disabled:opacity-40 cursor-pointer"
      >
        {PATHS.map((p) => (
          <option key={p.value} value={p.value} className="bg-cream-200 dark:bg-ink text-ink dark:text-cream-200">
            {p.label}
          </option>
        ))}
      </select>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 dark:bg-cream-200/10 backdrop-blur-sm">
          <div className="bg-cream-200 dark:bg-ink border border-ink dark:border-cream-200 p-6 max-w-sm w-full mx-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-3">
              Confirm switch
            </div>
            <h3 className="text-lg font-black uppercase text-ink dark:text-cream-200 mb-2">
              Switch to {pendingLabel}?
            </h3>
            <p className="text-sm text-ink/60 dark:text-cream-200/60 mb-6 leading-relaxed">
              Your progress and badges for the current path will be reset. This cannot be undone.
            </p>
            <div className="flex gap-0">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border border-ink/30 dark:border-cream-200/30 text-ink/60 dark:text-cream-200/60 hover:border-ink dark:hover:border-cream-200 hover:text-ink dark:hover:text-cream-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity -ml-px"
              >
                Switch & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
