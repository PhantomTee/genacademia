"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useConnectors, useSwitchChain } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SIGN_IN_ERRORS, useSiweAuth } from "@/hooks/useSiweAuth";
import { studionetChain } from "@/lib/wagmi/chains";

const isAllowedChain = (id: number | undefined): boolean => id === studionetChain.id;

type Step = "idle" | "picking" | "connecting" | "switching" | "signing" | "redirecting";

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

  // Once wallet connects, auto-advance
  useEffect(() => {
    if (step === "connecting" && isConnected && address && chainId) {
      if (!isAllowedChain(chainId)) {
        setStep("switching");
        switchChain(
          { chainId: studionetChain.id },
          { onError: () => { setError("Wrong network — please switch to GenLayer Studionet manually"); setStep("idle"); } }
        );
      } else {
        doSignIn(address, chainId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, step]);

  // Once chain switches, advance to sign-in
  useEffect(() => {
    if (step === "switching" && isConnected && address && chainId && isAllowedChain(chainId)) {
      doSignIn(address, chainId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, step]);

  async function doSignIn(addr: string, chain: number) {
    setStep("signing");
    const result = await signInWithEthereum(addr, chain);
    if (result.ok) {
      setStep("redirecting");
      router.push("/dashboard");
    } else {
      setError(SIGN_IN_ERRORS[result.reason]);
      setStep("idle");
    }
  }

  function triggerConnect(connectorId: string) {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) {
      setError("Wallet not available");
      setStep("idle");
      return;
    }
    setStep("connecting");
    connect(
      { connector },
      {
        onError: (err) => {
          const msg = err?.message ?? "";
          setError(msg.toLowerCase().includes("reject") ? "Connection cancelled" : "Failed to connect wallet");
          setStep("idle");
        },
      }
    );
  }

  function handleClick() {
    setError(null);

    if (session) {
      router.push("/dashboard");
      return;
    }

    if (isConnected && address && chainId && isAllowedChain(chainId)) {
      doSignIn(address, chainId);
      return;
    }

    if (isConnected && chainId && !isAllowedChain(chainId)) {
      setStep("switching");
      switchChain(
        { chainId: studionetChain.id },
        { onError: () => { setError("Wrong network — switch to GenLayer Studionet manually"); setStep("idle"); } }
      );
      return;
    }

    if (connectors.length === 0) {
      setError("No EVM wallet detected. Please install MetaMask or another wallet.");
      return;
    }

    // More than one connector available — show picker
    if (connectors.length > 1) {
      setStep("picking");
      return;
    }

    // Only one connector — connect directly
    triggerConnect(connectors[0].id);
  }

  if (step === "picking") {
    return (
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-cream-200/50">
          Choose wallet
        </span>
        <div className="flex flex-col gap-1 w-full">
          {connectors.map((c) => (
            <button
              key={c.id}
              onClick={() => triggerConnect(c.id)}
              className={className + " w-full text-left"}
            >
              {c.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep("idle")}
          className="text-xs text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200 underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  const label =
    step === "connecting"  ? "Connecting wallet..." :
    step === "switching"   ? "Switching network..." :
    step === "signing"     ? "Sign the message..." :
    step === "redirecting" ? "Loading..." :
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
