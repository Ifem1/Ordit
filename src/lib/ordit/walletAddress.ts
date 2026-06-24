import { createClient } from "@/lib/supabase/client";
import { generatePrivateKey, createAccount } from "genlayer-js";

const STORAGE_KEY = "ordit_wallet_pk";

/** Returns or creates the user's Ethereum wallet, persisting address to Supabase and private key to localStorage. */
export async function getOrCreateWallet(): Promise<{ address: string; privateKey: string }> {
  // 1. Try localStorage first
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    try {
      const account = createAccount(stored as `0x${string}`);
      return { address: account.address, privateKey: stored };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // 2. Generate fresh wallet
  const privateKey = generatePrivateKey();
  const account = createAccount(privateKey as `0x${string}`);

  // 3. Persist address to profile
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ wallet_address: account.address })
      .eq("id", user.id);
  }

  // 4. Persist private key locally
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, privateKey);
  }

  return { address: account.address, privateKey };
}

/** Returns the user's wallet address (creates one if missing). Throws only if not authenticated. */
export async function getUserWalletAddress(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if address already in profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  const storedAddr = profile?.wallet_address as string | null;
  if (storedAddr && storedAddr.trim() !== "") {
    return storedAddr.trim();
  }

  // No address yet — create wallet now
  const { address } = await getOrCreateWallet();
  return address;
}
