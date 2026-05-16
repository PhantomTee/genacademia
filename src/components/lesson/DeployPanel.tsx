"use client";

import { useState } from "react";
import { useGenLayerClient } from "@/lib/wagmi/useGenLayerClient";

type DeployState = "idle" | "deploying" | "polling" | "success" | "error";

interface Props {
  lessonId: number;
  code: string;
  onDeployed: (address: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Waiting for validators...",
  PROPOSING: "Leader proposing result...",
  ACCEPTED: "Accepted — awaiting finality...",
  FINALIZED: "Deployed ✓",
  CANCELLED: "Transaction cancelled",
};

export function DeployPanel({ lessonId, code, onDeployed }: Props) {
  const glClient = useGenLayerClient();

  const [state, setState] = useState<DeployState>("idle");
  const [txHash, setTxHash] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [error, setError] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  async function handleDeploy() {
    if (!glClient) {
      setError("Wallet not connected. Connect your wallet first.");
      return;
    }
    setState("deploying");
    setError("");
    setStatusLabel("Deploying...");

    try {
      const hash = await (glClient as unknown as { deployContract: (o: { code: string; args: unknown[] }) => Promise<string> }).deployContract({ code, args: [] });
      setTxHash(hash);
      setState("polling");
      setStatusLabel(STATUS_LABELS.PENDING);

      await (glClient as unknown as {
        waitForTransactionReceipt: (o: { hash: string }) => Promise<unknown>;
      }).waitForTransactionReceipt({ hash });
      setStatusLabel(STATUS_LABELS.FINALIZED);

      // Fetch deployed address from Studio API now that the tx is finalized
      const addrRes = await fetch("/api/deploy/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const addrData = await addrRes.json() as { contractAddress?: string };
      const address = addrData.contractAddress ?? "";
      setContractAddress(address);
      setState("success");

      await fetch(`/api/lesson/${lessonId}/contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash, contractAddress: address }),
      });

      onDeployed(address);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Deployment failed");
    }
  }

  return (
    <div className="p-4 space-y-4 font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
          Network
        </span>
        <span className="text-[10px] uppercase tracking-widest text-ink dark:text-cream-200">
          Studionet
        </span>
      </div>

      {(state === "idle" || state === "error") && (
        <div className="space-y-3">
          {state === "error" && (
            <p className="text-xs text-red-500 leading-relaxed">{error}</p>
          )}
          <button
            onClick={handleDeploy}
            className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
          >
            {state === "error" ? "Retry Deploy" : "Deploy Contract"}
          </button>
        </div>
      )}

      {(state === "deploying" || state === "polling") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-ink dark:border-cream-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-xs text-ink/70 dark:text-cream-200/70">{statusLabel}</span>
          </div>
          {txHash && (
            <div className="text-[10px] text-ink/40 dark:text-cream-200/40 break-all leading-relaxed">
              tx: {txHash}
            </div>
          )}
        </div>
      )}

      {state === "success" && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-ink dark:text-cream-200">
            ✓ Deployed
          </div>
          {contractAddress ? (
            <div className="text-[10px] text-ink/50 dark:text-cream-200/50 break-all leading-relaxed">
              {contractAddress}
            </div>
          ) : (
            <p className="text-[10px] text-ink/50 dark:text-cream-200/50 leading-relaxed">
              Paste your contract address in the{" "}
              <span className="text-ink dark:text-cream-200">Verify</span> tab.
            </p>
          )}
          <button
            onClick={handleDeploy}
            className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200 transition-colors"
          >
            Redeploy
          </button>
        </div>
      )}
    </div>
  );
}
