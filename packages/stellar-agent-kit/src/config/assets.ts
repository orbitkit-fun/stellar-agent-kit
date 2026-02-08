/**
 * Stellar asset identifiers and contract addresses (mainnet only).
 */

export type StellarAsset = { code: string; issuer: string } | { contractId: string };

export const MAINNET_ASSETS = {
  XLM: { contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA" },
  USDC: { contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75" },
} as const;

/** SoroSwap aggregator contract ID (mainnet). */
export const SOROSWAP_AGGREGATOR = "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH" as const;
