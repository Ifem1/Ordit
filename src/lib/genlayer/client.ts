import { createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";
import { studionet } from "genlayer-js/chains";
import type { Account } from "viem";

function assertContractAddress(contractAddress: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error("Set NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS to a deployed OrditContract address.");
  }
}

function browserWalletAccount(address: string): Account {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Connect Rabby or MetaMask with a valid wallet address.");
  }
  // genlayer-js delegates signing to the injected provider for browser wallets,
  // but its write path still expects an account object with an address field.
  return { address: address as `0x${string}` } as unknown as Account;
}

function normalizeGenLayerError(err: unknown, method: string): Error {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("Missing or invalid parameters") || message.includes("execution failed")) {
    return new Error(
      `Contract call failed for ${method}. The configured address may point to an older OrditContract deployment; redeploy the updated contract and set NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS.`,
    );
  }
  return err instanceof Error ? err : new Error(message);
}

// ── Build a genlayer-js client ─────────────────────────────────────────────────

function buildReadClient() {
  return createClient({ chain: studionet });
}

function buildWriteClient(address: string) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Connect Rabby or MetaMask to submit GenLayer transactions.");
  }
  const account = browserWalletAccount(address);
  return createClient({
    chain: studionet,
    account,
    provider: window.ethereum,
  });
}

// ── Read a contract view function ─────────────────────────────────────────────

export async function callGenLayerRead<T>(
  contractAddress: string,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kwargs: Record<string, any> = {},
): Promise<T> {
  assertContractAddress(contractAddress);
  const client = buildReadClient();
  try {
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      functionName: method,
      args: [],
      kwargs,
    });
    return result as T;
  } catch (err) {
    throw normalizeGenLayerError(err, method);
  }
}

// ── Write a contract state-modifying function ─────────────────────────────────

export async function callGenLayerWrite(
  contractAddress: string,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kwargs: Record<string, any> = {},
  senderAddress: string,
): Promise<{ tx_hash: string; result: unknown }> {
  assertContractAddress(contractAddress);
  const account = browserWalletAccount(senderAddress);
  const client = buildWriteClient(senderAddress);
  await client.connect("studionet");

  try {
    const txHash = await client.writeContract({
      account,
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
  } catch (err) {
    throw normalizeGenLayerError(err, method);
  }
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
    const { tx_hash, result } = await callGenLayerWrite(
      contractAddress,
      method,
      args,
      senderAddress,
    );
    return { result: result as T, tx_hash };
  } else {
    const result = await callGenLayerRead<T>(contractAddress, method, args);
    return { result };
  }
}
