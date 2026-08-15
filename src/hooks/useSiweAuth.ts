"use client";

import { useSignMessage } from "wagmi";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useState } from "react";

export type SignInFailure =
  | "service-unavailable"
  | "rate-limited"
  | "user-rejected"
  | "verification-failed"
  | "unknown";

export type SignInResult = { ok: true } | { ok: false; reason: SignInFailure };

// Copy lives here so every entry point into sign-in reports the same cause
// the same way. Never blame the wallet for a failure that happened on our side.
export const SIGN_IN_ERRORS: Record<SignInFailure, string> = {
  "service-unavailable":
    "Sign-in is unavailable right now — we couldn't reach our server. This is on our side, not your wallet.",
  "rate-limited": "Too many sign-in attempts. Wait a minute and try again.",
  "user-rejected": "Signature declined in your wallet. Approve it to sign in.",
  "verification-failed":
    "We couldn't verify that signature. Please try signing in again.",
  unknown: "Sign-in failed unexpectedly. Please try again.",
};

function isUserRejection(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { name?: string; code?: number; message?: string };
  if (e.name === "UserRejectedRequestError") return true;
  if (e.code === 4001) return true;
  const msg = e.message?.toLowerCase() ?? "";
  return msg.includes("user rejected") || msg.includes("user denied");
}

export function useSiweAuth() {
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEthereum(
    address: string,
    chainId: number
  ): Promise<SignInResult> {
    setIsLoading(true);
    setError(null);

    const fail = (reason: SignInFailure): SignInResult => {
      setError(SIGN_IN_ERRORS[reason]);
      setIsLoading(false);
      return { ok: false, reason };
    };

    // 1. Fetch a nonce. Anything that goes wrong here is a backend problem —
    // the wallet has not even been opened yet.
    let nonce: string;
    try {
      const res = await fetch(
        `/api/auth/nonce?address=${encodeURIComponent(address)}`,
        { cache: "no-store" }
      );
      if (res.status === 429) return fail("rate-limited");
      if (!res.ok) return fail("service-unavailable");
      nonce = (await res.json()).nonce;
      if (!nonce) return fail("service-unavailable");
    } catch {
      return fail("service-unavailable");
    }

    // 2. Ask for the signature. This is the only step the user can decline.
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in to GenAcademia",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    });

    let signature: string;
    try {
      signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
    } catch (err) {
      return fail(isUserRejection(err) ? "user-rejected" : "unknown");
    }

    // 3. Hand the signed message to NextAuth for server-side verification.
    try {
      const result = await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
      if (!result || result.error) return fail("verification-failed");
    } catch {
      return fail("service-unavailable");
    }

    setIsLoading(false);
    return { ok: true };
  }

  return { signInWithEthereum, isLoading, error };
}
