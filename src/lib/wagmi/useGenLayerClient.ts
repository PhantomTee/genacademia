"use client";

import { useConnectorClient } from "wagmi";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export function useGenLayerClient() {
  const { data: connectorClient } = useConnectorClient();

  if (!connectorClient) return null;

  return createClient({
    chain: studionet,
    account: connectorClient.account,
    provider: connectorClient,
  });
}
