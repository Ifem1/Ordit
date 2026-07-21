export const GENLAYER_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? "61999"),
  rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api",
  explorerUrl: process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ?? "https://explorer-studio.genlayer.com",
  contractAddress: process.env.NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS ?? "",
  defaultSender: process.env.NEXT_PUBLIC_GENLAYER_DEFAULT_SENDER ?? "0x0000000000000000000000000000000000000001",
} as const;

export type GenLayerConfig = typeof GENLAYER_CONFIG;
