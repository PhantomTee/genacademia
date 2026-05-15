"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NetworkPage() {
  const router = useRouter();
  const { update } = useSession();
  const [selected, setSelected] = useState<"studionet" | "localnet">("studionet");
  const [saving, setSaving] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  async function handleFinish() {
    setSaving(true);
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ networkTarget: selected }),
    });
    await update();
    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest border border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40 mb-4">
          Step 3 of 3
        </span>
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          Choose your network
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream-200/60 mt-2">
          Where will your contracts deploy during lessons?
        </p>
      </div>

      <div className="space-y-0">
        <button
          onClick={() => setSelected("studionet")}
          className={`w-full text-left p-5 border transition-all ${
            selected === "studionet"
              ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
              : "border-ink/15 dark:border-cream-200/15 hover:border-ink/40 dark:hover:border-cream-200/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`font-black uppercase tracking-tight ${
                selected === "studionet"
                  ? "text-cream-200 dark:text-ink"
                  : "text-ink dark:text-cream-200"
              }`}
            >
              Studionet
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest border px-1.5 py-0.5 ${
                selected === "studionet"
                  ? "border-cream-200/30 dark:border-ink/30 text-cream-200/70 dark:text-ink/70"
                  : "border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40"
              }`}
            >
              Recommended
            </span>
          </div>
          <div
            className={`text-sm mt-0.5 ${
              selected === "studionet"
                ? "text-cream-200/70 dark:text-ink/70"
                : "text-ink/60 dark:text-cream-200/60"
            }`}
          >
            Hosted GenLayer environment at studio.genlayer.com. No local setup needed.
          </div>
        </button>

        <button
          onClick={() => setSelected("localnet")}
          className={`w-full text-left p-5 border transition-all -mt-px ${
            selected === "localnet"
              ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
              : "border-ink/15 dark:border-cream-200/15 hover:border-ink/40 dark:hover:border-cream-200/40"
          }`}
        >
          <div
            className={`font-black uppercase tracking-tight ${
              selected === "localnet"
                ? "text-cream-200 dark:text-ink"
                : "text-ink dark:text-cream-200"
            }`}
          >
            Localnet
          </div>
          <div
            className={`text-sm mt-0.5 ${
              selected === "localnet"
                ? "text-cream-200/70 dark:text-ink/70"
                : "text-ink/60 dark:text-cream-200/60"
            }`}
          >
            Run GenLayer locally with Docker.{" "}
            <code
              className={`font-mono text-xs ${
                selected === "localnet"
                  ? "text-cream-200 dark:text-ink"
                  : "text-ink dark:text-cream-200"
              }`}
            >
              genlayer up
            </code>
          </div>
        </button>
      </div>

      <button
        onClick={() => setShowDiff(!showDiff)}
        className="mt-4 text-xs font-mono uppercase tracking-widest text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200 transition-colors"
      >
        {showDiff ? "▲ Hide" : "▼ What's the difference?"}
      </button>

      {showDiff && (
        <div className="mt-3 p-5 border border-ink/15 dark:border-cream-200/15 text-sm text-ink/70 dark:text-cream-200/70 space-y-3">
          <p>
            <strong className="text-ink dark:text-cream-200 font-bold">Studionet</strong>{" "}
            is hosted by the GenLayer team. It has test GEN tokens, no Docker, and works from any browser.
          </p>
          <p>
            <strong className="text-ink dark:text-cream-200 font-bold">Localnet</strong>{" "}
            runs on your machine via Docker. Use it for full logs, offline access, or custom validator configs.
          </p>
          <p className="text-ink/50 dark:text-cream-200/50">
            You can change this any time from your profile.
          </p>
        </div>
      )}

      <button
        onClick={handleFinish}
        disabled={saving}
        className="mt-6 w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
      >
        {saving ? "Setting up..." : "Start Learning →"}
      </button>
    </div>
  );
}
