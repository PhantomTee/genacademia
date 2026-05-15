"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = [
  { value: "PREDICTION_MARKET", label: "Prediction Market" },
  { value: "FREELANCE_ESCROW", label: "Freelance Escrow" },
  { value: "DAO", label: "DAO" },
  { value: "DEVELOPER_REPUTATION", label: "Developer Reputation" },
  { value: "INSURANCE", label: "Insurance" },
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

  return (
    <>
      <select
        value={currentPath}
        disabled={loading}
        onChange={(e) => handleSelect(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {PATHS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold text-lg mb-2">
              Switch Project Path?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Switching path will reset all your progress and badges for the
              current path. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium"
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
