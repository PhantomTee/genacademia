"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import { useGenLayerClient } from "@/lib/wagmi/useGenLayerClient";
import { HELLO_CONTRACT } from "@/content/basics/lessons";
import {
  connectStudionet,
  type GenLayerWriteClient,
  waitForFinalizedSuccess,
} from "@/lib/genlayer/transactions";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
});

type Stage = "view" | "deploying" | "deployed" | "calling" | "done" | "error";

interface Props {
  lessonId: number;
  nextId: number | null;
}

export function DeployReadLesson({ lessonId, nextId }: Props) {
  const router = useRouter();
  const glClient = useGenLayerClient();

  const [stage, setStage] = useState<Stage>("view");
  const [contractAddress, setContractAddress] = useState("");
  const [deployStatus, setDeployStatus] = useState("");
  const [greeting, setGreeting] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleEditorMount: OnMount = (_editor, monaco) => {
    monaco.editor.setTheme("vs-dark");
  };

  async function handleDeploy() {
    if (!glClient) {
      setErrorMsg("Connect your wallet first.");
      setStage("error");
      return;
    }
    setStage("deploying");
    setDeployStatus("Sending transaction...");
    setErrorMsg("");
    try {
      const client = glClient as unknown as GenLayerWriteClient;
      await connectStudionet(client);
      const hash = await client.deployContract({ code: HELLO_CONTRACT, args: [] });
      setDeployStatus("Waiting for validators...");
      await waitForFinalizedSuccess(client, hash);

      const addrRes = await fetch("/api/deploy/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const addrData = await addrRes.json() as { contractAddress?: string };
      setContractAddress(addrData.contractAddress ?? "");
      setStage("deployed");
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Deployment failed");
    }
  }

  async function handleCall() {
    if (!contractAddress) {
      setErrorMsg("Paste your contract address below first.");
      return;
    }
    setStage("calling");
    setErrorMsg("");
    try {
      const res = await fetch("/api/basics/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress, method: "get_greeting", args: [] }),
      });
      const data = await res.json() as { result?: unknown; error?: string };
      if (data.error) throw new Error(data.error);
      setGreeting(String(data.result));
      setStage("done");
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Call failed");
    }
  }

  async function handleComplete() {
    setCompleting(true);
    await fetch(`/api/basics/${lessonId}/complete`, { method: "POST" });
    if (nextId) {
      router.push(`/basics/${nextId}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="space-y-4">
      {/* Code viewer */}
      <div className="border border-ink/15 dark:border-cream-200/15">
        <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">hello.gpy</span>
          <span className="text-xs text-gray-600 font-mono">read-only</span>
        </div>
        <div style={{ height: 220 }}>
          <MonacoEditor
            height="220px"
            language="python"
            theme="vs-dark"
            value={HELLO_CONTRACT}
            onMount={handleEditorMount}
            options={{
              readOnly: true,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              tabSize: 4,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Step 1: Deploy */}
      <div className="border border-ink/15 dark:border-cream-200/15 p-4 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
          Step 1 — Deploy
        </div>

        {(stage === "view" || stage === "error") && (
          <>
            {stage === "error" && (
              <p className="text-xs text-red-500 leading-relaxed">{errorMsg}</p>
            )}
            <button
              onClick={handleDeploy}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Deploy HelloGenLayer
            </button>
          </>
        )}

        {stage === "deploying" && (
          <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-cream-200/60">
            <span className="w-3 h-3 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {deployStatus}
          </div>
        )}

        {(stage === "deployed" || stage === "calling" || stage === "done") && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              ✓ Deployed
            </div>
            {contractAddress ? (
              <div className="text-[10px] font-mono text-ink/50 dark:text-cream-200/50 break-all leading-relaxed">
                {contractAddress}
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[10px] text-ink/50 dark:text-cream-200/50">
                  Address not auto-detected — paste it from the GenLayer Studio explorer:
                </p>
                <input
                  type="text"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value.trim())}
                  className="w-full text-xs font-mono px-3 py-2 border border-ink/30 dark:border-cream-200/30 bg-transparent text-ink dark:text-cream-200 placeholder-ink/20 dark:placeholder-cream-200/20 focus:outline-none focus:border-ink dark:focus:border-cream-200"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Call */}
      {(stage === "deployed" || stage === "calling" || stage === "done") && (
        <div className="border border-ink/15 dark:border-cream-200/15 p-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Step 2 — Call get_greeting()
          </div>

          <div className="font-mono text-xs border border-ink/10 dark:border-cream-200/10 p-3 space-y-1">
            <div className="text-ink/40 dark:text-cream-200/40">Method</div>
            <div className="text-ink dark:text-cream-200">get_greeting()</div>
          </div>

          {stage === "deployed" && (
            <button
              onClick={handleCall}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Call get_greeting()
            </button>
          )}

          {stage === "calling" && (
            <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-cream-200/60">
              <span className="w-3 h-3 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Calling...
            </div>
          )}

          {stage === "done" && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
                Return value
              </div>
              <div className="text-lg font-bold font-mono text-ink dark:text-cream-200">
                &ldquo;{greeting}&rdquo;
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "done" && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
        >
          {completing ? "Loading..." : "Task complete — Next lesson →"}
        </button>
      )}
    </div>
  );
}
