"use client";

import { useEffect, useRef, useState } from "react";

const CONFIRM_MS = 4000;
const POLL_MS = 20000;

/**
 * Surfaces a database outage site-wide. Without it the failure is invisible:
 * every page still renders, but sign-in dies at the nonce call and visitors
 * are left assuming the wallet flow is broken.
 */
export function ServiceBanner() {
  const [down, setDown] = useState(false);
  const failures = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      let ok = false;
      try {
        const res = await fetch("/api/health/db", { cache: "no-store" });
        ok = res.ok && (await res.json())?.ok === true;
      } catch {
        ok = false;
      }
      if (cancelled) return;

      failures.current = ok ? 0 : failures.current + 1;
      // A single failure is usually a serverless cold start, which recovers in
      // seconds. Only claim an outage once it fails twice in a row.
      setDown(failures.current >= 2);

      timer = setTimeout(check, failures.current === 1 ? CONFIRM_MS : POLL_MS);
    }

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!down) return null;

  return (
    <div
      role="status"
      className="px-4 py-2 bg-red-900/40 border-b border-red-700/50 text-red-300 text-sm flex items-center gap-2"
    >
      <span aria-hidden="true">⚠</span>
      <span>
        Sign-in is temporarily unavailable — we can&apos;t reach our database.
        This is on our side, not your wallet. Please try again shortly.
      </span>
    </div>
  );
}
