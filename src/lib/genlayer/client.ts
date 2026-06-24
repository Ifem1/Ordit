import { createClient, createAccount } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";
import { studionet } from "genlayer-js/chains";

const STORAGE_KEY = "ordit_wallet_pk";

// ── Build a genlayer-js client ─────────────────────────────────────────────────

function buildClient(privateKey?: string) {
  const account = privateKey
    ? createAccount(privateKey as `0x${string}`)
    : createAccount();
  return createClient({ chain: studionet, account });
}

// ── Read a contract view function ─────────────────────────────────────────────

export async function callGenLayerRead<T>(
  contractAddress: string,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kwargs: Record<string, any> = {},
): Promise<T> {
  const client = buildClient();
  const result = await client.readContract({
    address: contractAddress as `0x${string}`,
    functionName: method,
    args: [],
    kwargs,
  });
  return result as T;
}

// ── Write a contract state-modifying function ─────────────────────────────────

export async function callGenLayerWrite(
  contractAddress: string,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kwargs: Record<string, any> = {},
  privateKey: string,
): Promise<{ tx_hash: string; result: unknown }> {
  const client = buildClient(privateKey);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: method,
    args: [],
    kwargs,
    value: BigInt(0),
  });

  const receipt = await client.waitForTransactionReceipt({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hash: txHash as any,
    status: TransactionStatus.ACCEPTED,
    interval: 3000,
    retries: 60,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (receipt as any)?.result ?? null;
  return { tx_hash: String(txHash), result };
}

// ── Unified wrapper called by orditContract.ts ────────────────────────────────
// senderAddress = the user's Ethereum wallet address (0x + 40 chars).
// The matching private key is fetched from localStorage.

export async function callGenLayerMethod<T>(
  contractAddress: string,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any> = {},
  senderAddress?: string,
): Promise<{ result: T; tx_hash?: string }> {
  if (senderAddress) {
    const pk = getStoredPrivateKey();
    const { tx_hash, result } = await callGenLayerWrite(
      contractAddress,
      method,
      args,
      pk,
    );
    return { result: result as T, tx_hash };
  } else {
    const result = await callGenLayerRead<T>(contractAddress, method, args);
    return { result };
  }
}

function getStoredPrivateKey(): string {
  if (typeof window === "undefined") {
    throw new Error("GenLayer write calls must run in the browser");
  }
  const pk = localStorage.getItem(STORAGE_KEY);
  if (!pk) {
    throw new Error(
      "Wallet not initialised. Open Settings to set up your wallet.",
    );
  }
  return pk;
}
