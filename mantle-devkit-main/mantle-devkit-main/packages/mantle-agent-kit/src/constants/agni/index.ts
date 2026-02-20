// Agni Finance contract addresses on Mantle Network
// Agni is a Uniswap V3 fork - #1 DEX on Mantle with $87.9M TVL
// Official site: https://agni.finance

// Factory contract - Creates and manages liquidity pools
export const FACTORY = {
  mainnet: "0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// SwapRouter - Main contract for executing swaps
export const SWAP_ROUTER = {
  mainnet: "0x319B69888b0d11cEC22caA5034e25FfFBDc88421" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// NFT Position Manager - Manages liquidity positions
export const POSITION_MANAGER = {
  mainnet: "0x218bf598d1453383e2f4aa7b14ffb9bfb102d637" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// WMNT (Wrapped MNT) - native token wrapper
export const WMNT = {
  mainnet: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

// SwapRouter ABI (Uniswap V3 compatible)
export const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Common fee tiers (in hundredths of a bip, i.e. 1e-6)
export const FEE_TIERS = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000, // 1%
} as const;
