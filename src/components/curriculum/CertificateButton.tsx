"use client";

import { useState } from "react";

interface Props {
  track: string;
}

export function CertificateButton({ track }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/certificate/${track}`);
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Could not generate certificate.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `genacademia-certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="text-xs font-mono uppercase tracking-widest text-ink/50 dark:text-cream-200/50 border border-ink/20 dark:border-cream-200/20 px-3 py-1 hover:border-ink dark:hover:border-cream-200 hover:text-ink dark:hover:text-cream-200 disabled:opacity-30 transition-colors"
    >
      {loading ? "Generating…" : "↓ Certificate"}
    </button>
  );
}
