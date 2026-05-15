"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PATHS = [
  {
    id: "PREDICTION_MARKET",
    brand: "PredictX",
    tagline: "Decentralised prediction markets resolved by AI.",
    feature: "AI oracle resolution",
  },
  {
    id: "FREELANCE_ESCROW",
    brand: "TrustLance",
    tagline: "Trustless escrow that releases funds when AI confirms delivery.",
    feature: "AI dispute resolution",
  },
  {
    id: "DAO",
    brand: "GovMind",
    tagline: "AI-governed DAO where proposals are evaluated on-chain.",
    feature: "AI voting analysis",
  },
  {
    id: "DEVELOPER_REPUTATION",
    brand: "CodeVault",
    tagline: "On-chain reputation scored by AI from real contributions.",
    feature: "AI contribution scoring",
  },
  {
    id: "INSURANCE",
    brand: "CaseWise",
    tagline: "Parametric insurance that pays out automatically on verified claims.",
    feature: "AI claims assessment",
  },
];

export default function ProjectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectPath: selected }),
    });
    router.push("/onboarding/network");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest border border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40 mb-4">
          Step 2 of 3
        </span>
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          Choose your final project
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream-200/60 mt-2">
          Every lesson, example, and capstone will be built toward this goal.
        </p>
      </div>

      <div className="space-y-0">
        {PATHS.map((path, idx) => (
          <button
            key={path.id}
            onClick={() => setSelected(path.id)}
            className={`w-full text-left p-5 border transition-all -mt-px first:mt-0 ${
              selected === path.id
                ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
                : "border-ink/15 dark:border-cream-200/15 hover:border-ink/40 dark:hover:border-cream-200/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={`text-lg font-black uppercase tracking-tight ${
                    selected === path.id
                      ? "text-cream-200 dark:text-ink"
                      : "text-ink dark:text-cream-200"
                  }`}
                >
                  {path.brand}
                </div>
                <div
                  className={`text-sm mt-0.5 ${
                    selected === path.id
                      ? "text-cream-200/70 dark:text-ink/70"
                      : "text-ink/60 dark:text-cream-200/60"
                  }`}
                >
                  {path.tagline}
                </div>
              </div>
              <span
                className={`flex-shrink-0 text-xs font-bold uppercase tracking-widest px-2 py-0.5 border mt-0.5 ${
                  selected === path.id
                    ? "border-cream-200/30 dark:border-ink/30 text-cream-200/70 dark:text-ink/70"
                    : "border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40"
                }`}
              >
                {path.feature}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected || saving}
        className="mt-6 w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
      >
        {saving ? "Saving..." : "Continue →"}
      </button>
    </div>
  );
}
