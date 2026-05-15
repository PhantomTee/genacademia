"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { studionetChain } from "./chains";

export const wagmiConfig = createConfig({
  chains: [studionetChain],
  connectors: [injected()],
  transports: {
    [studionetChain.id]: http(),
  },
  ssr: true,
});
