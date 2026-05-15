"use client";

import { useEffect, useState } from "react";

export function NetworkBanner() {
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/network/health");
        const data = await res.json();
        setUnreachable(!data.ok);
      } catch {
        setUnreachable(true);
      }
    }

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!unreachable) return null;

  return (
    <div className="px-4 py-2 bg-amber-900/40 border-b border-amber-700/50 text-amber-300 text-sm flex items-center gap-2">
      <span>⚠</span>
      <span>Cannot reach Studionet. Check your connection at studio.genlayer.com.</span>
    </div>
  );
}
