"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { studionetChain, localnetChain } from "./chains";

export const wagmiConfig = createConfig({
  chains: [studionetChain, localnetChain],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [studionetChain.id]: http(),
    [localnetChain.id]: http(),
  },
  ssr: true,
});
