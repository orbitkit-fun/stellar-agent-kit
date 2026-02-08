import { Keypair } from '@stellar/stellar-sdk';
import { z } from 'zod';

declare const NetworkConfigSchema: z.ZodObject<{
    horizonUrl: z.ZodString;
    sorobanRpcUrl: z.ZodString;
    friendbotUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    horizonUrl: string;
    sorobanRpcUrl: string;
    friendbotUrl?: string | undefined;
}, {
    horizonUrl: string;
    sorobanRpcUrl: string;
    friendbotUrl?: string | undefined;
}>;
type NetworkConfig = z.infer<typeof NetworkConfigSchema>;
declare const networks: {
    readonly mainnet: {
        horizonUrl: string;
        sorobanRpcUrl: string;
        friendbotUrl?: string | undefined;
    };
};
type NetworkName = keyof typeof networks;
/** Returns mainnet config. This project is mainnet-only. */
declare function getNetworkConfig(name?: string): NetworkConfig;

/**
 * DEX / swap types (Stellar: asset = code+issuer or contractId).
 */
interface DexAsset {
    contractId?: string;
    code?: string;
    issuer?: string;
}
interface QuoteResult {
    expectedIn: string;
    expectedOut: string;
    minOut: string;
    route: string[];
    rawData?: unknown;
}
interface SwapResult {
    hash: string;
    status: string;
}

/**
 * DEX module – swap, quote, aggregator (SoroSwap).
 * Pluggable: add more DEXes by implementing DexClient.
 */

interface DexClient {
    getQuote(fromAsset: DexAsset, toAsset: DexAsset, amount: string): Promise<QuoteResult>;
    executeSwap(secretKey: string, quote: QuoteResult): Promise<SwapResult>;
}
/**
 * Build a DEX client for the given network (SoroSwap aggregator).
 */
declare function createDexClient(networkConfig: NetworkConfig, apiKey?: string): DexClient;

/**
 * Reflector oracle client – SEP-40 price feeds on Stellar.
 * Uses lastprice(asset) for current price. Asset = Stellar(Address) | Other(Symbol).
 * Contract IDs: https://developers.stellar.org/docs/data/oracles/oracle-providers
 */

/** Either a Soroban token contract ID (C...) or a ticker symbol (e.g. "XLM", "BTC") for off-chain feeds. */
type OracleAsset = {
    contractId: string;
} | {
    symbol: string;
};
interface PriceData {
    price: string;
    timestamp: number;
    decimals: number;
}
interface ReflectorOracleConfig {
    networkConfig: NetworkConfig;
    /** Which feed: DEX (default), CEX/DEX, or Fiat. */
    feed?: "dex" | "cexDex" | "fiat";
}
declare function createReflectorOracle(config: ReflectorOracleConfig): {
    lastprice: (asset: OracleAsset) => Promise<PriceData>;
    decimals: () => Promise<number>;
    contractId: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M" | "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN" | "CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC";
};
type ReflectorOracle = ReturnType<typeof createReflectorOracle>;

/**
 * Oracle contract addresses (Reflector SEP-40, Band) – mainnet only.
 * Source: https://developers.stellar.org/docs/data/oracles/oracle-providers
 */
declare const REFLECTOR_ORACLE: {
    /** Stellar Mainnet DEX prices */
    readonly dex: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M";
    /** External CEX & DEX rates */
    readonly cexDex: "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN";
    /** Fiat exchange rates */
    readonly fiat: "CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC";
};
declare const BAND_ORACLE: "CCQXWMZVM3KRTXTUPTN53YHL272QGKF32L7XEDNZ2S6OSUFK3NFBGG5M";

/**
 * Blend lending integration – supply and borrow via Blend Protocol on Stellar.
 * Uses @blend-capital/blend-sdk. Pool IDs: see docs.blend.capital/mainnet-deployments
 */

/** Mainnet Blend pool ID. More at mainnet.blend.capital */
declare const BLEND_POOLS_MAINNET: "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS";
/** @deprecated Use BLEND_POOLS_MAINNET. Kept for compatibility. */
declare const BLEND_POOLS: {
    readonly mainnet: "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS";
};
interface LendingSupplyArgs {
    /** Pool contract ID (C...). */
    poolId: string;
    /** Reserve asset contract ID (e.g. USDC, XLM token contract). */
    assetContractId: string;
    /** Amount in asset's smallest unit (e.g. 7 decimals for USDC). */
    amount: string;
}
interface LendingBorrowArgs {
    poolId: string;
    assetContractId: string;
    amount: string;
}
interface LendingResult {
    hash: string;
    status: string;
}
/**
 * Supply (deposit) an asset to a Blend pool as collateral or liquidity.
 */
declare function lendingSupply(networkConfig: NetworkConfig, secretKey: string, args: LendingSupplyArgs): Promise<LendingResult>;
/**
 * Borrow an asset from a Blend pool.
 */
declare function lendingBorrow(networkConfig: NetworkConfig, secretKey: string, args: LendingBorrowArgs): Promise<LendingResult>;

/**
 * StellarAgentKit – unified DeFi agent (MNTAgentKit-style API for Stellar).
 * Constructor(secretKey, network) + initialize() then protocol methods.
 */

/** This project is mainnet-only. */
type StellarNetwork = "mainnet";
declare class StellarAgentKit {
    readonly keypair: Keypair;
    readonly network: StellarNetwork;
    readonly config: NetworkConfig;
    private _initialized;
    private _dex;
    private _horizon;
    private _oracle;
    constructor(secretKey: string, network?: StellarNetwork);
    /**
     * Initialize clients (Horizon, Soroban RPC, protocol wrappers).
     * Call after construction before using protocol methods.
     */
    initialize(): Promise<this>;
    private ensureInitialized;
    /**
     * Get a swap quote (exact-in). Uses SoroSwap aggregator (SoroSwap, Phoenix, Aqua).
     */
    dexGetQuote(fromAsset: DexAsset, toAsset: DexAsset, amount: string): Promise<QuoteResult>;
    /**
     * Execute a swap using a prior quote.
     */
    dexSwap(quote: QuoteResult): Promise<SwapResult>;
    /**
     * One-shot: get quote and execute swap (convenience).
     */
    dexSwapExactIn(fromAsset: DexAsset, toAsset: DexAsset, amount: string): Promise<SwapResult>;
    /**
     * Send a native or custom-asset payment (Horizon).
     * @param to - Destination account (G...)
     * @param amount - Amount in display units (e.g. "10" for 10 XLM)
     * @param assetCode - Optional; omit for native XLM
     * @param assetIssuer - Optional; required if assetCode is set
     */
    sendPayment(to: string, amount: string, assetCode?: string, assetIssuer?: string): Promise<{
        hash: string;
    }>;
    /**
     * Get latest price for an asset from Reflector oracle.
     * @param asset - { contractId: "C..." } for on-chain token or { symbol: "XLM" } for ticker
     */
    getPrice(asset: OracleAsset): Promise<PriceData>;
    /**
     * Supply (deposit) an asset to a Blend pool.
     */
    lendingSupply(args: LendingSupplyArgs): Promise<LendingResult>;
    /**
     * Borrow an asset from a Blend pool.
     */
    lendingBorrow(args: LendingBorrowArgs): Promise<LendingResult>;
}

/**
 * Stellar asset identifiers and contract addresses (mainnet only).
 */
type StellarAsset = {
    code: string;
    issuer: string;
} | {
    contractId: string;
};
declare const MAINNET_ASSETS: {
    readonly XLM: {
        readonly contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA";
    };
    readonly USDC: {
        readonly contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
    };
};
/** SoroSwap aggregator contract ID (mainnet). */
declare const SOROSWAP_AGGREGATOR: "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH";

export { BAND_ORACLE, BLEND_POOLS, BLEND_POOLS_MAINNET, type DexAsset, type DexClient, type LendingBorrowArgs, type LendingResult, type LendingSupplyArgs, MAINNET_ASSETS, type NetworkConfig, type NetworkName, type OracleAsset, type PriceData, type QuoteResult, REFLECTOR_ORACLE, type ReflectorOracle, type ReflectorOracleConfig, SOROSWAP_AGGREGATOR, StellarAgentKit, type StellarAsset, type StellarNetwork, type SwapResult, createDexClient, createReflectorOracle, getNetworkConfig, lendingBorrow, lendingSupply, networks };
