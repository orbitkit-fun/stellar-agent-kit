// Uniswap V3 contract addresses on Mantle
// Reference: https://docs.uniswap.org/contracts/v3/reference/deployments

// SwapRouter02 - Universal Router for swaps
export const SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

// QuoterV2 - For getting swap quotes
export const QUOTER_V2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

// Factory address
export const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// WETH address on Mantle
export const WMNT_ADDRESS = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8";

// Native token placeholder
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Default fee tiers (in hundredths of a bip)
export const FEE_TIERS = {
  LOWEST: 100,    // 0.01%
  LOW: 500,       // 0.05%
  MEDIUM: 3000,   // 0.3%
  HIGH: 10000,    // 1%
} as const;

// Default pool fee
export const DEFAULT_POOL_FEE = FEE_TIERS.MEDIUM;
