"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NetworkPage() {
  const router = useRouter();
  const { update } = useSession();
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ networkTarget: "studionet" }),
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
          Deploy to Studionet
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream-200/60 mt-2">
          All lessons deploy to GenLayer Studionet — hosted, no local setup needed.
        </p>
      </div>

      <div className="p-5 border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200">
        <div className="font-black uppercase tracking-tight text-cream-200 dark:text-ink">
          Studionet
        </div>
        <div className="text-sm mt-0.5 text-cream-200/70 dark:text-ink/70">
          Hosted GenLayer environment at studio.genlayer.com. Test GEN tokens included, works from any browser.
        </div>
      </div>

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
