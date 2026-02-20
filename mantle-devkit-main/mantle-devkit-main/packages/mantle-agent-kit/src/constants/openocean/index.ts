// OpenOcean API configuration
export const OPENOCEAN_BASE_URL = "https://open-api.openocean.finance/v4";

// Chain identifiers for OpenOcean
export const OPENOCEAN_CHAIN = {
  mainnet: "mantle",
  testnet: "mantle", // OpenOcean may not support testnet
} as const;

// Native token address (ETH on Mantle)
export const NATIVE_TOKEN_ADDRESS =
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000";

// OpenOcean exchange proxy address on Mantle
export const OPENOCEAN_EXCHANGE_PROXY =
  "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64";
