"use client";

import { useConnectorClient } from "wagmi";
import { createClient } from "genlayer-js";
import { studionet, localnet } from "genlayer-js/chains";
import type { NetworkTarget } from "@/lib/genlayer/constants";

export function useGenLayerClient(network: NetworkTarget = "studionet") {
  const { data: connectorClient } = useConnectorClient();

  const chain = network === "studionet" ? studionet : localnet;

  if (!connectorClient) return null;

  return createClient({
    chain,
    provider: connectorClient,
  });
}
