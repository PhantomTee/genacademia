import { createClient } from "genlayer-js";
import { studionet } from "./chains";

export function getGenLayerClient() {
  return createClient({ chain: studionet });
}
