export interface InjectedWallet {
  address: string;
  provider: unknown;
}

declare global {
  interface Window {
    ethereum?: {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum?.request);
}

export async function getConnectedWallet(): Promise<InjectedWallet | null> {
  if (!hasInjectedWallet()) return null;
  const accounts = await window.ethereum!.request!({ method: "eth_accounts" });
  const address = Array.isArray(accounts) ? String(accounts[0] ?? "") : "";
  return address ? { address, provider: window.ethereum } : null;
}

export async function connectInjectedWallet(): Promise<InjectedWallet> {
  if (!hasInjectedWallet()) {
    throw new Error("Install Rabby or MetaMask to connect a wallet.");
  }
  const accounts = await window.ethereum!.request!({ method: "eth_requestAccounts" });
  const address = Array.isArray(accounts) ? String(accounts[0] ?? "") : "";
  if (!address) throw new Error("No wallet account was selected.");
  return { address, provider: window.ethereum };
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
