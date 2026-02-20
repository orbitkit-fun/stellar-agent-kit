// mETH Protocol - Mantle's Liquid Staking Token
// Official docs: https://docs.mantle.xyz/meth
// mETH represents staked ETH with accumulated rewards

// mETH Token Address on Mantle L2
export const METH_TOKEN = {
  mainnet: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// WETH (Wrapped ETH) address on Mantle - for mETH swaps (mETH is ETH-backed)
export const WETH_TOKEN = {
  mainnet: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111" as const,
  testnet: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111" as const,
} as const;

// WMNT (Wrapped MNT) address on Mantle
export const WMNT_TOKEN = {
  mainnet: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as const,
  testnet: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as const,
} as const;

// Native MNT token address (used by DEX aggregators)
export const NATIVE_MNT_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as const;

// mETH exchange rate increases over time (1 mETH ≈ 1.08 ETH as of Dec 2025)
// This is a value-accumulating token, not a rebasing token

// mETH ABI for reading balance and exchange rate
export const METH_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
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
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
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
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
