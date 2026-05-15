"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LEVELS = [
  {
    id: "BEGINNER",
    title: "New to coding",
    desc: "I'm just getting started with programming. Explain things from scratch.",
  },
  {
    id: "DEVELOPER",
    title: "Developer, new to web3",
    desc: "I write code professionally but haven't built on blockchains before.",
  },
  {
    id: "WEB3",
    title: "Web3 developer",
    desc: "I've built Solidity or other smart contracts. Just show me GenLayer's differences.",
  },
];

export default function ExperiencePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceLevel: selected }),
    });
    router.push("/onboarding/project");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest border border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40 mb-4">
          Step 1 of 3
        </span>
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          What&apos;s your background?
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream-200/60 mt-2">
          We&apos;ll tailor the lesson depth to match your experience.
        </p>
      </div>

      <div className="space-y-0">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelected(level.id)}
            className={`w-full text-left p-5 border transition-all -mt-px first:mt-0 ${
              selected === level.id
                ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
                : "border-ink/15 dark:border-cream-200/15 hover:border-ink/40 dark:hover:border-cream-200/40"
            }`}
          >
            <div
              className={`font-black uppercase tracking-tight ${
                selected === level.id
                  ? "text-cream-200 dark:text-ink"
                  : "text-ink dark:text-cream-200"
              }`}
            >
              {level.title}
            </div>
            <div
              className={`text-sm mt-0.5 ${
                selected === level.id
                  ? "text-cream-200/70 dark:text-ink/70"
                  : "text-ink/60 dark:text-cream-200/60"
              }`}
            >
              {level.desc}
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
