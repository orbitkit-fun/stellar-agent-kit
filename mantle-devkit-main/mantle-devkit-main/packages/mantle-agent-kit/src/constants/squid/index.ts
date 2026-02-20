// Squid Router API configuration
export const SQUID_BASE_URL = "https://api.squidrouter.com/v2";

// Chain IDs for Squid Router (LayerZero chain IDs)
export const SQUID_CHAIN_ID = {
  mainnet: 5000, // Mantle mainnet
  testnet: 5003, // Mantle testnet
} as const;

// Common destination chains (LayerZero chain IDs)
export const DESTINATION_CHAINS = {
  ethereum: 101,
  arbitrum: 110,
  optimism: 111,
  polygon: 109,
  base: 184,
  bsc: 102,
  avalanche: 106,
  mantle: 5000,
} as const;

// Native token address
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

