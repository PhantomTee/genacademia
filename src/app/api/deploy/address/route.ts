import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGenLayerClient } from "@/lib/genlayer/client";
import { NETWORK_CONFIG } from "@/lib/genlayer/constants";
import {
  getRecipientAddress,
  type GenLayerReadClient,
  ZERO_ADDRESS,
} from "@/lib/genlayer/transactions";

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(NETWORK_CONFIG.studionet.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const json = await res.json() as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

type ReceiptResult = {
  recipient?: string;
  data?: {
    contract_address?: string;
  };
};

function isAddress(value: unknown): value is `0x${string}` {
  return (
    typeof value === "string" &&
    value.startsWith("0x") &&
    value.toLowerCase() !== ZERO_ADDRESS
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { txHash } = await req.json() as { txHash?: string };
  if (!txHash?.startsWith("0x")) {
    return NextResponse.json({ error: "txHash required" }, { status: 400 });
  }

  try {
    const client = getGenLayerClient() as unknown as GenLayerReadClient;
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
    let contractAddress = getRecipientAddress(tx);
    let receipt: ReceiptResult | null = null;

    if (!contractAddress) {
      receipt = await rpcCall<ReceiptResult>("gen_getTransactionReceipt", [
        { txId: txHash },
      ]);
      const deployedAddress = receipt?.data?.contract_address;
      if (isAddress(deployedAddress)) {
        contractAddress = deployedAddress;
      } else if (isAddress(receipt?.recipient)) {
        contractAddress = receipt.recipient;
      }
    }

    return NextResponse.json({
      contractAddress,
      _raw: {
        transaction: {
          recipient: tx.recipient,
          to_address: tx.to_address,
          txExecutionResultName: tx.txExecutionResultName,
        },
        receipt,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
