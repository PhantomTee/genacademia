"use client";

import { useEffect, useState } from "react";

/**
 * Intercepts all fetch() calls globally and shows a non-blocking toast
 * when any API route returns 401 (session expired / wallet disconnected).
 *
 * Must be rendered inside the client tree (Providers). Renders nothing until
 * a 401 is detected, so there is zero overhead in the happy path.
 */
export function SessionExpiryToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);

      // Only alert once per visibility cycle; ignore non-API paths
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
      if (res.status === 401 && url.startsWith("/api/")) {
        setVisible(true);
      }

      return res;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
                 bg-amber-50 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-600
                 text-amber-900 dark:text-amber-100 text-sm px-4 py-3 rounded-lg shadow-lg
                 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span>⚠️ Session expired — reconnect your wallet.</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 text-amber-600 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-bold"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
