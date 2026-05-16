"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const COOLDOWN_SECONDS = 120;

function getCooldownRemaining(): number {
  if (typeof document === "undefined") return 0;
  const match = document.cookie.match(/(?:^|; )ga-faucet-ts=([^;]*)/);
  if (!match) return 0;
  const ts = parseInt(match[1], 10);
  if (isNaN(ts)) return 0;
  const elapsed = Math.floor((Date.now() - ts) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

interface Props {
  lessonId: number;
  nextId: number | null;
}

export function FaucetLesson({ lessonId, nextId }: Props) {
  const router = useRouter();
  const [balance, setBalance] = useState<string | null>(null);
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [funded, setFunded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completing, setCompleting] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function loadBalance() {
    try {
      const res = await fetch("/api/balance");
      const data = await res.json() as { balance?: string };
      if (data.balance !== undefined) setBalance(data.balance);
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    loadBalance();
    const initial = getCooldownRemaining();
    if (initial > 0) setCooldown(initial);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleFund() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; retryAfter?: number };
      if (data.error) {
        if (data.retryAfter) setCooldown(data.retryAfter);
        throw new Error(data.error);
      }
      await loadBalance();
      setFunded(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Faucet failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    await fetch(`/api/basics/${lessonId}/complete`, { method: "POST" });
    setCompleting(false);
    setTaskDone(true);
    await new Promise((r) => setTimeout(r, 700));
    if (nextId) {
      router.push(`/basics/${nextId}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="border border-ink/15 dark:border-cream-200/15 p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-2">
          Wallet Balance
        </div>
        <div className="text-3xl font-black font-mono text-ink dark:text-cream-200">
          {balance !== null ? (
            `${balance} GEN`
          ) : (
            <span className="text-ink/20 dark:text-cream-200/20 animate-pulse text-xl">
              Loading...
            </span>
          )}
        </div>
      </div>

      {/* Faucet */}
      <div className="border border-ink/15 dark:border-cream-200/15 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Request Testnet GEN
          </div>
          {cooldown > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30">
              Cooldown {cooldown}s
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink/50 dark:text-cream-200/50">Amount</span>
            <span className="font-bold text-ink dark:text-cream-200">{amount} GEN</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={cooldown > 0 || loading}
            className="w-full accent-ink dark:accent-cream-200 disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] text-ink/30 dark:text-cream-200/30">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <button
          onClick={handleFund}
          disabled={loading || cooldown > 0}
          className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
        >
          {loading ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : `Get ${amount} GEN`}
        </button>

        {errorMsg && (
          <p className="text-xs text-red-500 leading-relaxed">{errorMsg}</p>
        )}
        {funded && (
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            ✓ {amount} GEN received — balance updated
          </p>
        )}
      </div>

      {funded && (
        <button
          onClick={handleComplete}
          disabled={completing || taskDone}
          className={`w-full py-3 text-sm font-bold uppercase tracking-widest border transition-all ${
            taskDone
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30"
          }`}
        >
          {taskDone ? "✓ Complete" : completing ? "Saving..." : "Task complete — Next lesson →"}
        </button>
      )}
    </div>
  );
}
