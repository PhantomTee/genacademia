"use client";

import { useState, useMemo } from "react";

interface DiffLine {
  type: "same" | "add" | "remove";
  text: string;
}

function computeLineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");

  // LCS table
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: "add", text: b[j] });
      j++;
    } else {
      result.push({ type: "remove", text: a[i] });
      i++;
    }
  }
  return result;
}

interface Props {
  starterCode: string;
  expectedCode: string;
  title?: string;
  defaultOpen?: boolean;
}

export function DiffView({ starterCode, expectedCode, title = "Solution diff", defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const diff = useMemo(
    () => computeLineDiff(starterCode.trimEnd(), expectedCode.trimEnd()),
    [starterCode, expectedCode]
  );

  const addCount = diff.filter((l) => l.type === "add").length;
  const removeCount = diff.filter((l) => l.type === "remove").length;

  return (
    <div className="mt-4 border border-ink/15 dark:border-cream-200/15">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-ink/60 dark:text-cream-200/60 hover:text-ink dark:hover:text-cream-200 transition-colors bg-ink/3 dark:bg-cream-200/3"
      >
        <span className="uppercase tracking-widest font-bold">{title}</span>
        <span className="flex gap-2">
          {addCount > 0 && <span className="text-emerald-500">+{addCount}</span>}
          {removeCount > 0 && <span className="text-red-400">−{removeCount}</span>}
          <span>{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {open && (
        <div className="overflow-x-auto">
          <pre className="text-[11px] font-mono leading-5 select-text">
            {diff.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "add"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : line.type === "remove"
                    ? "bg-red-500/10 text-red-500 dark:text-red-400 line-through opacity-60"
                    : "text-ink/50 dark:text-cream-200/50"
                }
              >
                <span className="select-none pr-2 text-[10px] opacity-40 inline-block w-5 text-right">
                  {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
                </span>
                {line.text || " "}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
