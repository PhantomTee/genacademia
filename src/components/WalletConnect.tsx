"use client";

import { useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useConnectors, useSwitchChain } from "wagmi";
import { useSession, signOut } from "next-auth/react";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { useRouter } from "next/navigation";
import { studionetChain } from "@/lib/wagmi/chains";

const btnBase =
  "px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all -ml-px";
const btnPrimary =
  btnBase +
  " border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80";
const btnOutline =
  btnBase +
  " border-ink/20 dark:border-cream-200/20 hover:border-ink dark:hover:border-cream-200 text-ink dark:text-cream-200";

const ALLOWED_CHAINS: number[] = [studionetChain.id];

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: session } = useSession();
  const { signInWithEthereum, isLoading: isSigningIn, error: signInError } = useSiweAuth();
  const router = useRouter();

  // Sign out automatically when the wallet account changes mid-session.
  // Without this, session.user.walletAddress stays stale and the user sees
  // data belonging to their previously signed-in wallet.
  const prevAddress = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!session?.user?.walletAddress) {
      prevAddress.current = address;
      return;
    }
    if (prevAddress.current !== undefined && address !== prevAddress.current) {
      signOut({ redirect: false });
    }
    prevAddress.current = address;
  }, [address, session?.user?.walletAddress]);

  async function handleSignIn() {
    if (!address || !chainId) return;
    const ok = await signInWithEthereum(address, chainId);
    if (ok) router.push("/dashboard");
  }

  function handleDisconnect() {
    disconnect();
    signOut({ redirect: false });
  }

  // Step 1: not connected
  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isConnecting}
        className={btnPrimary + " disabled:opacity-40"}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  // Step 2: connected but wrong network
  if (chainId && !ALLOWED_CHAINS.includes(chainId)) {
    return (
      <div className="flex items-center gap-0">
        <span className={btnOutline + " cursor-default font-mono normal-case tracking-normal text-red-500 border-red-500/30"}>
          Wrong network
        </span>
        <button
          onClick={() => switchChain({ chainId: studionetChain.id })}
          disabled={isSwitching}
          className={btnPrimary + " disabled:opacity-40"}
        >
          {isSwitching ? "Switching..." : "Switch to Studionet"}
        </button>
      </div>
    );
  }

  // Step 3: right network, not signed in
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0">
          <span className={btnOutline + " cursor-default font-mono normal-case tracking-normal"}>
            {address!.slice(0, 6)}...{address!.slice(-4)}
          </span>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className={btnPrimary + " disabled:opacity-40"}
          >
            {isSigningIn ? "Signing..." : "Sign In"}
          </button>
        </div>
        {signInError && (
          <span className="text-xs text-red-500">{signInError}</span>
        )}
      </div>
    );
  }

  // Step 4: signed in
  return (
    <div className="flex items-center gap-0">
      <span className={btnOutline + " cursor-default font-mono normal-case tracking-normal"}>
        {address!.slice(0, 6)}...{address!.slice(-4)}
      </span>
      <button onClick={handleDisconnect} className={btnOutline}>
        Disconnect
      </button>
    </div>
  );
}
