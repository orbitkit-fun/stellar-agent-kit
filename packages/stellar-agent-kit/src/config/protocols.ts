/**
 * Stellar DeFi protocol contract addresses (mainnet).
 * SoroSwap and Blend are in assets.ts and lending/; here: FxDAO and Allbridge reference.
 */

/** FxDAO: synthetic stablecoins (USDx, EURx, GBPx) and vaults (fxdao.io/docs/addresses). */
export const FXDAO_MAINNET = {
  vaults: "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB",
  lockingPool: "CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP",
  usdx: "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  eurx: "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U",
  gbpx: "CBCO65UOWXY2GR66GOCMCN6IU3Y45TXCPBY3FLUNL4AOUMOCKVIVV6JC",
  fxg: "CDBR4FMYL5WPUDBIXTBEBU2AFEYTDLXVOTRZHXS3JC575C7ZQRKYZQ55",
  oracle: "CB5OTV4GV24T5USEZHFVYGC3F4A4MPUQ3LN56E76UK2IT7MJ6QXW4TFS",
} as const;

/**
 * Allbridge Core: cross-chain bridge to/from Stellar.
 * No single aggregator contract; integrate via @allbridge/bridge-core-sdk.
 * Docs: https://docs-core.allbridge.io/sdk/guides/stellar
 */
export const ALLBRIDGE_CORE_STELLAR_DOCS = "https://docs-core.allbridge.io/sdk/guides/stellar" as const;
