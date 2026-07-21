import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";

export async function getOrCreateWallet(): Promise<{ address: string; privateKey: string }> {
  const wallet = (await getConnectedWallet()) ?? (await connectInjectedWallet());
  return { address: wallet.address, privateKey: "" };
}

export async function getUserWalletAddress(): Promise<string> {
  const wallet = (await getConnectedWallet()) ?? (await connectInjectedWallet());
  return wallet.address;
}
