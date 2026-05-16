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

export async function connectStudionet(client: GenLayerWriteClient) {
  await client.connect?.("studionet");
}

export async function waitForFinalizedSuccess(
  client: GenLayerWriteClient,
  hash: `0x${string}`
) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error("Transaction finalized but contract execution failed.");
  }

  return receipt;
}

export function getRecipientAddress(tx: GenLayerTransaction) {
  const recipient = tx.recipient ?? tx.to_address;
  if (!recipient || recipient.toLowerCase() === ZERO_ADDRESS) return "";
  return recipient;
}
