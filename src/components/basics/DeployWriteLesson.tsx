"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGenLayerClient } from "@/lib/wagmi/useGenLayerClient";
import { WRITE_CONTRACT } from "@/content/basics/lessons";

type Stage = "idle" | "deploying" | "deployed" | "writing" | "reading" | "verified" | "error";

interface Props {
  lessonId: number;
  nextId: number | null;
}

export function DeployWriteLesson({ lessonId, nextId }: Props) {
  const router = useRouter();
  const glClient = useGenLayerClient();

  const [stage, setStage] = useState<Stage>("idle");
  const [contractAddress, setContractAddress] = useState("");
  const [newGreeting, setNewGreeting] = useState("Hello from me!");
  const [returnedGreeting, setReturnedGreeting] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [completing, setCompleting] = useState(false);

  async function handleDeploy() {
    if (!glClient) {
      setErrorMsg("Connect your wallet first.");
      setStage("error");
      return;
    }
    setStage("deploying");
    setErrorMsg("");
    try {
      const client = glClient as unknown as {
        deployContract: (o: { code: string; args: unknown[] }) => Promise<string>;
        waitForTransactionReceipt: (o: { hash: string }) => Promise<unknown>;
      };
      const hash = await client.deployContract({ code: WRITE_CONTRACT, args: [] });
      await client.waitForTransactionReceipt({ hash });

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

  async function handleWrite() {
    if (!contractAddress) {
      setErrorMsg("Paste your contract address above first.");
      return;
    }
    if (!newGreeting.trim()) {
      setErrorMsg("Enter a greeting message.");
      return;
    }
    if (!glClient) {
      setErrorMsg("Wallet not connected.");
      return;
    }
    setStage("writing");
    setErrorMsg("");
    try {
      const client = glClient as unknown as {
        callContractFunction: (o: {
          contractAddress: string;
          functionName: string;
          args: unknown[];
        }) => Promise<string>;
        waitForTransactionReceipt: (o: { hash: string }) => Promise<unknown>;
      };
      const hash = await client.callContractFunction({
        contractAddress,
        functionName: "set_greeting",
        args: [newGreeting.trim()],
      });
      await client.waitForTransactionReceipt({ hash });
      setStage("reading");
      await handleRead();
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Write call failed");
    }
  }

  async function handleRead() {
    try {
      const res = await fetch("/api/basics/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress, method: "get_greeting", args: [] }),
      });
      const data = await res.json() as { result?: unknown; error?: string };
      if (data.error) throw new Error(data.error);
      setReturnedGreeting(String(data.result));
      setStage("verified");
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Read call failed");
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
      {/* Step 1: Deploy */}
      <div className="border border-ink/15 dark:border-cream-200/15 p-4 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
          Step 1 — Deploy
        </div>

        {(stage === "idle" || stage === "error") && (
          <>
            {stage === "error" && (
              <p className="text-xs text-red-500 leading-relaxed">{errorMsg}</p>
            )}
            <button
              onClick={handleDeploy}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Deploy Contract
            </button>
          </>
        )}

        {stage === "deploying" && (
          <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-cream-200/60">
            <span className="w-3 h-3 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Waiting for validators...
          </div>
        )}

        {stage !== "idle" && stage !== "deploying" && stage !== "error" && (
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
                  Paste your contract address from GenLayer Studio:
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

      {/* Step 2: Write */}
      {(stage === "deployed" || stage === "writing" || stage === "reading" || stage === "verified") && (
        <div className="border border-ink/15 dark:border-cream-200/15 p-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Step 2 — Call set_greeting()
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
              New greeting
            </label>
            <input
              type="text"
              value={newGreeting}
              onChange={(e) => setNewGreeting(e.target.value)}
              disabled={stage !== "deployed"}
              placeholder="Type your greeting..."
              className="w-full text-sm px-3 py-2 border border-ink/20 dark:border-cream-200/20 bg-transparent text-ink dark:text-cream-200 placeholder-ink/20 dark:placeholder-cream-200/20 focus:outline-none focus:border-ink dark:focus:border-cream-200 disabled:opacity-40"
            />
          </div>

          {stage === "deployed" && (
            <button
              onClick={handleWrite}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
            >
              Call set_greeting()
            </button>
          )}

          {(stage === "writing" || stage === "reading") && (
            <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-cream-200/60">
              <span className="w-3 h-3 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              {stage === "writing" ? "Sending write transaction..." : "Reading back result..."}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Verify */}
      {stage === "verified" && (
        <div className="border border-ink/15 dark:border-cream-200/15 p-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Step 3 — Verified
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-ink/40 dark:text-cream-200/40">
              get_greeting() returned:
            </div>
            <div className="text-lg font-bold font-mono text-ink dark:text-cream-200">
              &ldquo;{returnedGreeting}&rdquo;
            </div>
          </div>
          <p className="text-xs text-ink/50 dark:text-cream-200/50">
            The blockchain stored your message. The write → wait → read pattern is complete.
          </p>
        </div>
      )}

      {stage === "verified" && (
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
