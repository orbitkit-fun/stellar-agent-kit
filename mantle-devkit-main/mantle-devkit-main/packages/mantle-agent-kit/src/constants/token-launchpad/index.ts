// Token & RWA Launchpad Constants for Mantle Network

// Standard ERC20 ABI
export const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Token types
export type TokenType = "standard" | "rwa";

// Token configuration
export interface TokenConfig {
  name: string;
  symbol: string;
  supply: string; // Human readable (e.g., "1000000" for 1M tokens)
  decimals?: number;
  tokenType?: TokenType;
  // RWA specific fields
  assetType?: string; // e.g., "Real Estate", "Commodities", "Securities"
  assetId?: string; // External asset identifier
}

// Token deployment result
export interface TokenDeploymentResult {
  tokenAddress: string;
  txHash: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  mintedTo: string;
  tokenType: TokenType;
  assetType?: string;
  assetId?: string;
}

// Token info
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
}
