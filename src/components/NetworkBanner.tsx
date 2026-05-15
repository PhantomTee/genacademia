"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function NetworkBanner() {
  const { data: session } = useSession();
  const [unreachable, setUnreachable] = useState(false);
  const network = session?.user?.networkTarget ?? "studionet";

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
  }, [network]);

  if (!unreachable) return null;

  return (
    <div className="px-4 py-2 bg-amber-900/40 border-b border-amber-700/50 text-amber-300 text-sm flex items-center gap-2">
      <span>⚠</span>
      {network === "studionet" ? (
        <span>
          Cannot reach Studionet. Check your connection or switch to Localnet in
          Settings.
        </span>
      ) : (
        <span>
          Localnet not running. Start it with:{" "}
          <code className="font-mono text-amber-200">genlayer up</code> (port
          4000)
        </span>
      )}
    </div>
  );
}
