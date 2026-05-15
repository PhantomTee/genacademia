"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

type EIP1193Provider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
type GenLayerClient = ReturnType<typeof createClient>;

export function useGenLayerClient(): GenLayerClient | null {
  const { address, connector } = useAccount();
  const [client, setClient] = useState<GenLayerClient | null>(null);

  useEffect(() => {
    if (!address || !connector) {
      setClient(null);
      return;
    }

    connector.getProvider().then((rawProvider) => {
      if (!rawProvider) {
        setClient(null);
        return;
      }
      setClient(
        createClient({
          chain: studionet,
          // account must be the address string so genlayer-js routes
          // eth_sendTransaction through the wallet provider, not locally
          account: address,
          provider: rawProvider as EIP1193Provider,
        })
      );
    });
  }, [address, connector]);

  return client;
}
