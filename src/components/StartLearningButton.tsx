"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useConnectors, useSwitchChain } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { studionetChain } from "@/lib/wagmi/chains";

const isAllowedChain = (id: number | undefined): boolean => id === studionetChain.id;

type Step = "idle" | "connecting" | "switching" | "signing" | "redirecting";

export function StartLearningButton({ className }: { className?: string }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { switchChain } = useSwitchChain();
  const { data: session } = useSession();
  const { signInWithEthereum } = useSiweAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  // Once wallet connects, auto-advance to sign-in (only when triggered by this button)
  useEffect(() => {
    if (step === "connecting" && isConnected && address && chainId) {
      if (!isAllowedChain(chainId)) {
        setStep("switching");
        switchChain(
          { chainId: studionetChain.id },
          { onError: () => { setError("Failed to switch network"); setStep("idle"); } }
        );
      } else {
        doSignIn(address, chainId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, step]);

  // Once chain switches, auto-advance to sign-in
  useEffect(() => {
    if (step === "switching" && isConnected && address && chainId && isAllowedChain(chainId)) {
      doSignIn(address, chainId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, step]);

  async function doSignIn(addr: string, chain: number) {
    setStep("signing");
    const ok = await signInWithEthereum(addr, chain);
    if (ok) {
      setStep("redirecting");
      router.push("/dashboard");
    } else {
      setError("Signature rejected — try again");
      setStep("idle");
    }
  }

  async function handleClick() {
    setError(null);

    // Already signed in — go straight to dashboard
    if (session) {
      router.push("/dashboard");
      return;
    }

    // Wallet connected + correct chain — just sign in
    if (isConnected && address && chainId && isAllowedChain(chainId)) {
      doSignIn(address, chainId);
      return;
    }

    // Wallet connected + wrong chain — switch first
    if (isConnected && chainId && !isAllowedChain(chainId)) {
      setStep("switching");
      switchChain(
        { chainId: studionetChain.id },
        { onError: () => { setError("Failed to switch network"); setStep("idle"); } }
      );
      return;
    }

    // Not connected — connect wallet (useEffect will auto-advance)
    setStep("connecting");
    connect({ connector: connectors[0] });
  }

  const label =
    step === "connecting" ? "Connecting wallet..." :
    step === "switching"  ? "Switching network..." :
    step === "signing"    ? "Sign the message..." :
    step === "redirecting"? "Loading..." :
    "Start Learning";

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={step !== "idle"}
        className={className}
      >
        {label}
      </button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
