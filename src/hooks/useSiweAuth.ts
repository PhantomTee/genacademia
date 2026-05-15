"use client";

import { useSignMessage } from "wagmi";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useState } from "react";

export function useSiweAuth() {
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEthereum(address: string, chainId: number) {
    setIsLoading(true);
    setError(null);

    try {
      const nonceRes = await fetch(
        `/api/auth/nonce?address=${encodeURIComponent(address)}`
      );
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to GenAcademia",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const result = await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { signInWithEthereum, isLoading, error };
}
