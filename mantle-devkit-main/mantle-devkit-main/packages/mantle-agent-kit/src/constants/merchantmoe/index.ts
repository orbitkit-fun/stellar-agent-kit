// Merchant Moe - #2 DEX on Mantle with $73.3M TVL
// TraderJoe fork with Liquidity Book (LB) 2.2
// Official docs: https://docs.merchantmoe.com

// LB Router - Main router for swaps
export const LB_ROUTER = {
  mainnet: "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// LB Factory - Creates liquidity book pairs
export const LB_FACTORY = {
  mainnet: "0xa6630671775c4EA2743840F9A5016dCf2A104054" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// LB Quoter - Get quotes for swaps
export const LB_QUOTER = {
  mainnet: "0x501b8AFd35df20f531fF45F6f695793AC3316c85" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// WMNT (Wrapped MNT) - native token wrapper
export const WMNT = {
  mainnet: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// MOE Token
export const MOE_TOKEN = "0x4515a45337f461a11ff0fe8abf3c606ae5dc00c9" as const;

// Version enum for LB pairs: V1=0, V2=1, V2_1=2, V2_2=3
export const LB_VERSION = {
  V1: 0,
  V2: 1,
  V2_1: 2,
  V2_2: 3,
} as const;

// Common bin steps for liquidity pairs
export const DEFAULT_BIN_STEP = 15;

// LB Router ABI for swaps
export const LB_ROUTER_ABI = [
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      {
        name: "path",
        type: "tuple",
        components: [
          { name: "pairBinSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "tokenPath", type: "address[]" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactNATIVEForTokens",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      {
        name: "path",
        type: "tuple",
        components: [
          { name: "pairBinSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "tokenPath", type: "address[]" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      {
        name: "path",
        type: "tuple",
        components: [
          { name: "pairBinSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "tokenPath", type: "address[]" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForNATIVE",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// LB Pair ABI to get pool version
export const LB_PAIR_ABI = [
  {
    inputs: [],
    name: "getTokenX",
    outputs: [{ name: "tokenX", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenY",
    outputs: [{ name: "tokenY", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getReservesAndId",
    outputs: [
      { name: "reserveX", type: "uint128" },
      { name: "reserveY", type: "uint128" },
      { name: "activeId", type: "uint24" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// LB Factory ABI for querying pools
export const LB_FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenX", type: "address" },
      { name: "tokenY", type: "address" },
    ],
    name: "getAllLBPairs",
    outputs: [
      {
        name: "lbPairsAvailable",
        type: "tuple[]",
        components: [
          { name: "binStep", type: "uint16" },
          { name: "LBPair", type: "address" },
          { name: "createdByOwner", type: "bool" },
          { name: "ignoredForRouting", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
