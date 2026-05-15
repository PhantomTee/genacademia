"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NetworkSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = current === "studionet" ? "localnet" : "studionet";
    setLoading(true);
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ networkTarget: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
    >
      {current === "studionet" ? "Studionet" : "Localnet"}
    </button>
  );
}
