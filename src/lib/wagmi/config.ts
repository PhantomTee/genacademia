"use client";

import { createConfig, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { studionetChain } from "./chains";

export const wagmiConfig = createConfig({
  chains: [studionetChain],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "GenAcademia" }),
  ],
  transports: {
    [studionetChain.id]: http(),
  },
  ssr: true,
});
