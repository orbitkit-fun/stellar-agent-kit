/**
 * Oracle contract addresses (Reflector SEP-40, Band) – mainnet only.
 * Source: https://developers.stellar.org/docs/data/oracles/oracle-providers
 */

export const REFLECTOR_ORACLE = {
  /** Stellar Mainnet DEX prices */
  dex: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M",
  /** External CEX & DEX rates */
  cexDex: "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN",
  /** Fiat exchange rates */
  fiat: "CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC",
} as const;

export const BAND_ORACLE = "CCQXWMZVM3KRTXTUPTN53YHL272QGKF32L7XEDNZ2S6OSUFK3NFBGG5M" as const;
