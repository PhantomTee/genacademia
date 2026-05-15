"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1e1e1e] animate-pulse rounded" />
  ),
});

interface Props {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  starterCode: string;
}

export function CodeEditor({ value, onChange, onReset, starterCode }: Props) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function handleReset() {
    if (showResetConfirm) {
      onChange(starterCode);
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-500 font-mono">contract.gpy</span>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          {showResetConfirm ? "Click again to reset" : "Reset to starter"}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            tabSize: 4,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
