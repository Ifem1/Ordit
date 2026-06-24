import { GENLAYER_CONFIG } from "./config";

export function getTxExplorerUrl(txHash: string): string {
  return `${GENLAYER_CONFIG.explorerUrl}/tx/${txHash}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `${GENLAYER_CONFIG.explorerUrl}/address/${address}`;
}

export function getContractExplorerUrl(): string {
  return getAddressExplorerUrl(GENLAYER_CONFIG.contractAddress);
}
