"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import { registerGenLayerPlugin } from "@/lib/monaco/genlayer-plugin";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1e1e1e] animate-pulse rounded" />
  ),
});

interface Props {
  value: string;
  onChange: (value: string) => void;
  starterCode: string;
  onLintErrorCount?: (count: number) => void;
}

export function CodeEditor({ value, onChange, starterCode, onLintErrorCount }: Props) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onLintRef = useRef(onLintErrorCount);
  onLintRef.current = onLintErrorCount;

  const handleMount: OnMount = (editor, monaco) => {
    cleanupRef.current?.();
    cleanupRef.current = registerGenLayerPlugin(monaco, editor);

    function reportMarkers() {
      const model = editor.getModel();
      if (!model) return;
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const errors = markers.filter((m: { severity: number }) => m.severity === monaco.MarkerSeverity.Error);
      onLintRef.current?.(errors.length);
    }

    // Report after each content change (plugin re-runs linting synchronously)
    const dispChange = editor.onDidChangeModelContent(() => {
      setTimeout(reportMarkers, 350);
    });
    // Initial report after plugin has run
    setTimeout(reportMarkers, 600);

    const origCleanup = cleanupRef.current;
    cleanupRef.current = () => {
      origCleanup?.();
      dispChange.dispose();
    };
  };

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
          onMount={handleMount}
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
