"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import { useGenLayerClient } from "@/lib/wagmi/useGenLayerClient";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse rounded" />,
});

const HELLO_CONTRACT = `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class HelloGenLayer(gl.Contract):
    greeting: str

    def __init__(self) -> None:
        self.greeting = "Hello, GenLayer!"

    @gl.public.view
    def get_greeting(self) -> str:
        return self.greeting
`;

const STEPS = [
  { id: 1, label: "What is GenLayer?" },
  { id: 2, label: "Your First Contract" },
  { id: 3, label: "Deploy" },
  { id: 4, label: "Call It" },
  { id: 5, label: "You're Ready!" },
] as const;

type DeployState = "idle" | "deploying" | "success" | "error";
type CallState = "idle" | "calling" | "success" | "error";

export default function HelloGenLayerPage() {
  const router = useRouter();
  const glClient = useGenLayerClient();

  const [step, setStep] = useState(1);
  const [contractAddress, setContractAddress] = useState("");
  const [greeting, setGreeting] = useState("");
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [deployError, setDeployError] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [callError, setCallError] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleEditorMount: OnMount = (_editor, monaco) => {
    monaco.editor.setTheme("vs-dark");
  };

  async function handleDeploy() {
    if (!glClient) {
      setDeployError("Connect your wallet first.");
      return;
    }
    setDeployState("deploying");
    setDeployError("");
    try {
      const client = glClient as unknown as {
        deployContract: (o: { code: string; args: unknown[] }) => Promise<string>;
        waitForTransactionReceipt: (o: { hash: string }) => Promise<Record<string, string>>;
      };
      const hash = await client.deployContract({ code: HELLO_CONTRACT, args: [] });
      const receipt = await client.waitForTransactionReceipt({ hash });
      const addr = receipt?.contractAddress ?? receipt?.contract_address ?? "";
      setContractAddress(addr);
      setDeployState("success");
    } catch (err) {
      setDeployState("error");
      setDeployError(err instanceof Error ? err.message : "Deployment failed");
    }
  }

  async function handleCall() {
    if (!glClient || !contractAddress) return;
    setCallState("calling");
    setCallError("");
    try {
      const client = glClient as unknown as {
        readContract: (o: { address: string; functionName: string; args: unknown[] }) => Promise<unknown>;
      };
      const result = await client.readContract({
        address: contractAddress,
        functionName: "get_greeting",
        args: [],
      });
      setGreeting(String(result));
      setCallState("success");
    } catch (err) {
      setCallState("error");
      setCallError(err instanceof Error ? err.message : "Call failed");
    }
  }

  async function handleComplete() {
    setCompleting(true);
    await fetch("/api/hello/complete", { method: "POST" });
    router.push("/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-12 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-colors ${
                  step === s.id
                    ? "bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink border-ink dark:border-cream-200"
                    : step > s.id
                    ? "bg-ink/20 dark:bg-cream-200/20 text-ink dark:text-cream-200 border-ink/30 dark:border-cream-200/30"
                    : "text-ink/30 dark:text-cream-200/30 border-ink/20 dark:border-cream-200/20"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <span
                className={`mt-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                  step === s.id
                    ? "text-ink dark:text-cream-200"
                    : "text-ink/30 dark:text-cream-200/30"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-ink/15 dark:bg-cream-200/15 flex-shrink-0 mx-1 mb-5" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: What is GenLayer? */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="border border-ink/30 dark:border-cream-200/30 px-5 py-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
              What is GenLayer?
            </h1>
          </div>

          <div className="space-y-4 text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed">
            <p>
              <strong className="text-ink dark:text-cream-200">GenLayer</strong> is a blockchain that lets
              smart contracts call AI models as part of their on-chain logic — natively, in a trustless way.
            </p>
            <p>
              Traditional smart contracts can only work with deterministic logic. GenLayer contracts can reason
              about natural language, evaluate open-ended questions, and use web data — all verified by the network.
            </p>
            <p>
              These are called <strong className="text-ink dark:text-cream-200">Intelligent Contracts</strong>.
              They're written in Python using a special runtime called <code className="text-xs bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5">genlayer</code>.
            </p>
          </div>

          <div className="border border-ink/20 dark:border-cream-200/20 p-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
              What you'll build in this course
            </div>
            <div className="space-y-2 text-sm text-ink/70 dark:text-cream-200/70">
              <p>You'll pick one of five intelligent contract tracks and build it across 30 lessons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PredictX — AI-resolved prediction markets</li>
                <li>TrustLance — freelance escrow with AI arbitration</li>
                <li>GovMind — DAO governance with AI proposal evaluation</li>
                <li>CodeVault — developer reputation with AI code review</li>
                <li>CaseWise — decentralized insurance with AI claims adjudication</li>
              </ul>
            </div>
          </div>

          <div className="border border-ink/20 dark:border-cream-200/20 p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
              Before you start
            </div>
            <p className="text-sm text-ink/70 dark:text-cream-200/70">
              Make sure your wallet is connected to <strong className="text-ink dark:text-cream-200">Studionet</strong> —
              GenLayer's hosted test network. You'll deploy your first contract in the next step.
            </p>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
          >
            Let's go →
          </button>
        </div>
      )}

      {/* Step 2: Your First Contract */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="border border-ink/30 dark:border-cream-200/30 px-5 py-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
              Your First Contract
            </h1>
          </div>

          <div className="space-y-3 text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed">
            <p>
              Every GenLayer contract is a Python class that extends <code className="text-xs bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5">gl.Contract</code>.
              Fields declared at class level become persistent on-chain storage.
            </p>
            <p>
              The <code className="text-xs bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5">@gl.public.view</code> decorator
              marks read-only methods — they don't cost gas and don't modify state.
            </p>
          </div>

          <div className="border border-ink/20 dark:border-cream-200/20">
            <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">hello.gpy</span>
              <span className="text-xs text-gray-600 font-mono">read-only preview</span>
            </div>
            <div style={{ height: 260 }}>
              <MonacoEditor
                height="260px"
                language="python"
                theme="vs-dark"
                value={HELLO_CONTRACT}
                onMount={handleEditorMount}
                options={{
                  readOnly: true,
                  fontSize: 13,
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

          <div className="border border-ink/20 dark:border-cream-200/20 p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
              What this contract does
            </div>
            <ul className="list-disc list-inside text-sm text-ink/70 dark:text-cream-200/70 space-y-1">
              <li>Stores a greeting string on-chain when deployed</li>
              <li>Exposes <code className="text-xs bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5">get_greeting()</code> so anyone can read it</li>
              <li>You'll deploy it to Studionet in the next step</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 text-sm font-bold uppercase tracking-widest border border-ink/30 dark:border-cream-200/30 text-ink/50 dark:text-cream-200/50 hover:text-ink dark:hover:text-cream-200 hover:border-ink dark:hover:border-cream-200 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Deploy it →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Deploy */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="border border-ink/30 dark:border-cream-200/30 px-5 py-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
              Deploy to Studionet
            </h1>
          </div>

          <p className="text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed">
            Deploying sends your contract code to the network. Validators process it, and your contract
            gets a permanent address that anyone can interact with.
          </p>

          {deployState === "idle" && (
            <button
              onClick={handleDeploy}
              className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Deploy HelloGenLayer
            </button>
          )}

          {deployState === "deploying" && (
            <div className="flex items-center gap-3 p-4 border border-ink/20 dark:border-cream-200/20">
              <span className="w-4 h-4 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm text-ink/70 dark:text-cream-200/70">
                Deploying — waiting for network consensus...
              </span>
            </div>
          )}

          {deployState === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-500">{deployError}</p>
              <button
                onClick={handleDeploy}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {deployState === "success" && (
            <div className="space-y-4">
              <div className="p-4 border border-ink/20 dark:border-cream-200/20 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-green-500">
                  ✓ Deployed
                </div>
                <div className="text-xs text-ink/50 dark:text-cream-200/50 break-all font-mono leading-relaxed">
                  {contractAddress}
                </div>
              </div>
              <p className="text-sm text-ink/70 dark:text-cream-200/70">
                Your contract is live on Studionet. Now let's call it.
              </p>
              <button
                onClick={() => setStep(4)}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
              >
                Call it →
              </button>
            </div>
          )}

          {deployState !== "success" && (
            <button
              onClick={() => setStep(2)}
              className="text-xs uppercase tracking-widest text-ink/30 dark:text-cream-200/30 hover:text-ink dark:hover:text-cream-200 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      {/* Step 4: Call It */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="border border-ink/30 dark:border-cream-200/30 px-5 py-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
              Call Your Contract
            </h1>
          </div>

          <p className="text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed">
            Read methods don't cost gas — they query the contract's current state directly.
            Let's read the greeting your contract stored when it was deployed.
          </p>

          <div className="p-4 border border-ink/20 dark:border-cream-200/20 space-y-1 font-mono text-xs">
            <div className="text-ink/40 dark:text-cream-200/40">Contract</div>
            <div className="text-ink/60 dark:text-cream-200/60 break-all">{contractAddress}</div>
            <div className="text-ink/40 dark:text-cream-200/40 mt-2">Method</div>
            <div className="text-ink dark:text-cream-200">get_greeting()</div>
          </div>

          {callState === "idle" && (
            <button
              onClick={handleCall}
              className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Call get_greeting()
            </button>
          )}

          {callState === "calling" && (
            <div className="flex items-center gap-3 p-4 border border-ink/20 dark:border-cream-200/20">
              <span className="w-4 h-4 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm text-ink/70 dark:text-cream-200/70">Calling...</span>
            </div>
          )}

          {callState === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-500">{callError}</p>
              <button
                onClick={handleCall}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {callState === "success" && (
            <div className="space-y-4">
              <div className="p-4 border border-ink/20 dark:border-cream-200/20 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
                  Return value
                </div>
                <div className="text-lg font-bold text-ink dark:text-cream-200 font-mono">
                  "{greeting}"
                </div>
              </div>
              <p className="text-sm text-ink/70 dark:text-cream-200/70">
                That's your contract responding from the blockchain. You just deployed and called your first
                GenLayer intelligent contract.
              </p>
              <button
                onClick={() => setStep(5)}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="border border-ink/30 dark:border-cream-200/30 px-5 py-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
              You're Ready
            </h1>
          </div>

          <div className="space-y-3 text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed">
            <p>
              You've written, deployed, and called your first GenLayer intelligent contract. That's the
              complete cycle you'll repeat across 30 lessons — each one adding something new to your contract.
            </p>
            <p>
              Your curriculum is waiting. Pick up where you left off — each lesson builds directly on
              the previous one, forming one complete contract by the end.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Lessons", value: "30" },
              { label: "Milestone badges", value: "6" },
              { label: "Final contract", value: "1" },
            ].map(({ label, value }) => (
              <div key={label} className="border border-ink/15 dark:border-cream-200/15 p-4">
                <div className="text-2xl font-black text-ink dark:text-cream-200">{value}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-3 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            {completing ? "Loading..." : "Go to my curriculum →"}
          </button>
        </div>
      )}
    </div>
  );
}
