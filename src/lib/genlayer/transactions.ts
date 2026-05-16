import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, GenLayerTransaction } from "genlayer-js/types";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface GenLayerWriteClient {
  connect?: (network?: "studionet") => Promise<void>;
  deployContract: (args: {
    code: string;
    args?: CalldataEncodable[];
  }) => Promise<`0x${string}`>;
  writeContract: (args: {
    address: `0x${string}`;
    functionName: string;
    args?: CalldataEncodable[];
    value?: bigint;
  }) => Promise<`0x${string}`>;
  waitForTransactionReceipt: (args: {
    hash: `0x${string}`;
    status?: TransactionStatus;
    fullTransaction?: boolean;
  }) => Promise<GenLayerTransaction>;
}

export interface GenLayerReadClient {
  getTransaction: (args: { hash: `0x${string}` }) => Promise<GenLayerTransaction>;
}

const STUDIONET_CHAIN_ID = "0xF21F"; // 61999
const STUDIONET_RPC =
  process.env.NEXT_PUBLIC_STUDIONET_RPC ?? "https://studio.genlayer.com/api";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export async function connectStudionet(_client: GenLayerWriteClient) {
  if (typeof window === "undefined") return;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  if (!eth) return;

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STUDIONET_CHAIN_ID }],
    });
  } catch (switchErr) {
    const code = (switchErr as { code?: number })?.code;
    if (code === 4902) {
      // Chain not yet in MetaMask — add it
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: STUDIONET_CHAIN_ID,
              chainName: "GenLayer Studionet",
              nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
              rpcUrls: [STUDIONET_RPC],
            },
          ],
        });
      } catch {
        // User rejected adding — proceed anyway
      }
    }
    // code 4001 = user rejected switch — proceed anyway
  }
}

export async function waitForFinalizedSuccess(
  client: GenLayerWriteClient,
  hash: `0x${string}`
) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error("Transaction accepted but contract execution failed.");
  }

  return receipt;
}

export function getRecipientAddress(tx: GenLayerTransaction) {
  const recipient = tx.recipient ?? tx.to_address;
  if (!recipient || recipient.toLowerCase() === ZERO_ADDRESS) return "";
  return recipient;
}
