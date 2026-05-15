"use client";

import { defineChain } from "viem";

export const studionetChain = defineChain({
  id: 61999,
  name: "GenLayer Studionet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_STUDIONET_RPC ?? "https://studio.genlayer.com/api",
      ],
    },
  },
});
