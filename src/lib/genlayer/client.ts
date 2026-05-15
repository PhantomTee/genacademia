import { createClient } from "genlayer-js";
import { studionet, localnet } from "./chains";
import type { NetworkTarget } from "./constants";

export function getGenLayerClient(network: NetworkTarget) {
  const chain = network === "studionet" ? studionet : localnet;
  return createClient({ chain });
}
