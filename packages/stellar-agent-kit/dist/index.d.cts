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
     * Get balances for an account (native + trustlines).
     * @param accountId - Stellar account ID (G...); defaults to this agent's public key
     * @returns List of balances: asset code, issuer (if not native), balance string, and optional limit
     */
    getBalances(accountId?: string): Promise<Array<{
        assetCode: string;
        issuer?: string;
        balance: string;
        limit?: string;
    }>>;
    /**
     * Create a new Stellar account (funding from this agent's account).
     * @param destination - New account's public key (G...)
     * @param startingBalance - Amount of XLM to send (e.g. "1" for 1 XLM; minimum ~1 XLM for base reserve)
     * @returns Transaction hash
     */
    createAccount(destination: string, startingBalance: string): Promise<{
        hash: string;
    }>;
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
     * Path payment (strict receive): send up to sendMax of sendAsset so destination receives exactly destAmount of destAsset.
     * @param sendAsset - Asset to send (native or { code, issuer })
     * @param sendMax - Maximum amount of sendAsset to send (display units)
     * @param destination - Recipient account (G...)
     * @param destAsset - Asset the recipient receives
     * @param destAmount - Exact amount of destAsset the recipient gets (display units)
     * @param path - Optional intermediate assets for the path
     */
    pathPayment(sendAsset: {
        assetCode: string;
        issuer?: string;
    }, sendMax: string, destination: string, destAsset: {
        assetCode: string;
        issuer?: string;
    }, destAmount: string, path?: Array<{
        assetCode: string;
        issuer?: string;
    }>): Promise<{
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

/**
 * Stellar DeFi protocol contract addresses (mainnet).
 * SoroSwap and Blend are in assets.ts and lending/; here: FxDAO and Allbridge reference.
 */
/** FxDAO: synthetic stablecoins (USDx, EURx, GBPx) and vaults (fxdao.io/docs/addresses). */
declare const FXDAO_MAINNET: {
    readonly vaults: "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB";
    readonly lockingPool: "CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP";
    readonly usdx: "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP";
    readonly eurx: "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U";
    readonly gbpx: "CBCO65UOWXY2GR66GOCMCN6IU3Y45TXCPBY3FLUNL4AOUMOCKVIVV6JC";
    readonly fxg: "CDBR4FMYL5WPUDBIXTBEBU2AFEYTDLXVOTRZHXS3JC575C7ZQRKYZQ55";
    readonly oracle: "CB5OTV4GV24T5USEZHFVYGC3F4A4MPUQ3LN56E76UK2IT7MJ6QXW4TFS";
};
/**
 * Allbridge Core: cross-chain bridge to/from Stellar.
 * No single aggregator contract; integrate via @allbridge/bridge-core-sdk.
 * Docs: https://docs-core.allbridge.io/sdk/guides/stellar
 */
declare const ALLBRIDGE_CORE_STELLAR_DOCS: "https://docs-core.allbridge.io/sdk/guides/stellar";

export { ALLBRIDGE_CORE_STELLAR_DOCS, BAND_ORACLE, BLEND_POOLS, BLEND_POOLS_MAINNET, type DexAsset, type DexClient, FXDAO_MAINNET, type LendingBorrowArgs, type LendingResult, type LendingSupplyArgs, MAINNET_ASSETS, type NetworkConfig, type NetworkName, type OracleAsset, type PriceData, type QuoteResult, REFLECTOR_ORACLE, type ReflectorOracle, type ReflectorOracleConfig, SOROSWAP_AGGREGATOR, StellarAgentKit, type StellarAsset, type StellarNetwork, type SwapResult, createDexClient, createReflectorOracle, getNetworkConfig, lendingBorrow, lendingSupply, networks };
