"use client";

import { useState, useEffect, useRef } from "react";

export function FaucetButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(10);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  async function loadBalance() {
    try {
      const res = await fetch("/api/balance");
      const data = await res.json() as { balance?: string; error?: string };
      if (data.balance !== undefined) setBalance(data.balance);
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    loadBalance();
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleFund() {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.error) throw new Error(data.error);
      setStatus("success");
      await loadBalance();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Faucet failed");
    } finally {
      setLoading(false);
    }
  }

  const btnBase =
    "px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all -ml-px";
  const btnOutline =
    btnBase +
    " border-ink/20 dark:border-cream-200/20 hover:border-ink dark:hover:border-cream-200 text-ink dark:text-cream-200";

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen((o) => !o); setStatus("idle"); }}
        className={btnOutline}
      >
        {balance !== null ? `${balance} GEN` : "Faucet"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 border border-ink/20 dark:border-cream-200/20 bg-cream-200 dark:bg-ink z-50 p-4 space-y-3 font-mono shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Request testnet GEN
          </div>

          {balance !== null && (
            <div className="text-xs text-ink/60 dark:text-cream-200/60">
              Balance: <span className="text-ink dark:text-cream-200 font-bold">{balance} GEN</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
                Amount (GEN)
              </label>
              <span className="text-xs font-bold text-ink dark:text-cream-200">{amount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={amount}
              onChange={(e) => { setAmount(Number(e.target.value)); setStatus("idle"); }}
              className="w-full accent-ink dark:accent-cream-200"
            />
            <div className="flex justify-between text-[10px] text-ink/30 dark:text-cream-200/30">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={amount}
              onChange={(e) => {
                const v = Math.min(100, Math.max(1, Math.floor(Number(e.target.value))));
                setAmount(v);
                setStatus("idle");
              }}
              className="w-16 text-xs font-mono px-2 py-1 border border-ink/20 dark:border-cream-200/20 bg-transparent text-ink dark:text-cream-200 focus:outline-none focus:border-ink dark:focus:border-cream-200 text-center"
            />
            <button
              onClick={handleFund}
              disabled={loading}
              className="flex-1 py-1.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
            >
              {loading ? "Sending..." : "Get GEN"}
            </button>
          </div>

          {status === "success" && (
            <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest">
              ✓ {amount} GEN sent
            </p>
          )}
          {status === "error" && (
            <p className="text-[11px] text-red-500 leading-relaxed">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
