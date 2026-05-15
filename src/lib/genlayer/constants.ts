export const SDK_DEPENDENCY_HASH =
  "1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6";

export const SDK_DEPENDENCY_HEADER = `# { "Depends": "py-genlayer:${SDK_DEPENDENCY_HASH}" }`;

export type NetworkTarget = "studionet" | "localnet";

export const NETWORK_CONFIG = {
  studionet: {
    rpcUrl: process.env.NEXT_PUBLIC_STUDIONET_RPC ?? "https://studio.genlayer.com/api",
    chainId: 61999,
    name: "Studionet",
    explorer: "https://explorer-studio.genlayer.com",
  },
  localnet: {
    rpcUrl: process.env.NEXT_PUBLIC_LOCALNET_RPC ?? "http://localhost:4000/api",
    chainId: 61127,
    name: "Localnet",
    explorer: "http://localhost:8080",
  },
} as const;
