/**
 * SoroSwap DeFi integration – quote and execute swaps via aggregator.
 *
 * RESEARCH (in comments):
 * 1) SoroSwap testnet aggregator contract ID
 *    - Source: https://github.com/soroswap/core/blob/main/public/testnet.contracts.json
 *    - Testnet "router" (aggregator): CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD
 *    - Mainnet SoroswapRouter: CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH
 *
 * 2) Soroban invoke parameters for aggregator
 *    - Quote: SoroSwap exposes quote via REST API (POST /quote). Direct contract "get_quote" / "quote"
 *      is not documented in public docs; API returns expectedIn, expectedOut, route. For contract-only
 *      path, use simulateTransaction on an invoke of the router with the view function name/args once
 *      published by SoroSwap.
 *    - Swap execution: API POST /quote/build returns XDR; sign and submit via Soroban RPC sendTransaction.
 *
 * 3) Uses rpc.Server (Soroban RPC) from @stellar/stellar-sdk for simulation and sendTransaction.
 */
import { z } from "zod";
import type { NetworkConfig } from "../config/networks.js";
import { type NetworkName } from "../config/networks.js";
/** Soroban token: contract ID (C...) or Stellar classic asset (code + issuer). */
export interface Asset {
    contractId?: string;
    code?: string;
    issuer?: string;
}
export declare const AssetSchema: z.ZodUnion<[z.ZodObject<{
    contractId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contractId: string;
}, {
    contractId: string;
}>, z.ZodObject<{
    code: z.ZodString;
    issuer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    issuer: string;
}, {
    code: string;
    issuer: string;
}>]>;
export interface QuoteResponse {
    expectedIn: string;
    expectedOut: string;
    minOut: string;
    route: string[];
    rawData?: unknown;
}
export declare const QuoteResponseSchema: z.ZodObject<{
    expectedIn: z.ZodString;
    expectedOut: z.ZodString;
    minOut: z.ZodString;
    route: z.ZodArray<z.ZodString, "many">;
    rawData: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    expectedIn: string;
    expectedOut: string;
    minOut: string;
    route: string[];
    rawData?: unknown;
}, {
    expectedIn: string;
    expectedOut: string;
    minOut: string;
    route: string[];
    rawData?: unknown;
}>;
/** Network name for executeSwap. */
export type Network = NetworkName;
/** Testnet: XLM (wrapped contract ID); AUSDC = classic testnet USDC with liquidity on SoroSwap. */
export declare const TESTNET_ASSETS: {
    readonly XLM: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
    /** Classic testnet USDC (has liquidity). Use for testnet swaps. */
    readonly AUSDC: {
        readonly code: "AUSDC";
        readonly issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
    };
    /** Legacy testnet USDC contract (often no path); prefer AUSDC. */
    readonly USDC: "CBBHRKEP5M3NUDRISGLJKGHDHX3DA2CN2AZBQY6WLVUJ7VNLGSKBDUCM";
};
export declare class SoroSwapClient {
    private readonly sorobanServer;
    private readonly networkConfig;
    private readonly apiKey;
    private readonly nativeAmmClient;
    constructor(networkConfig: NetworkConfig, apiKey?: string);
    /**
     * Get a swap quote: expected in/out, minOut, route.
     * Uses SoroSwap aggregator: first tries REST API (if API key set), then falls back to
     * simulating an aggregator contract call via Soroban RPC (view-style invocation).
     * @param sourceAddress - Optional valid G address for contract simulation source; if invalid, a fallback is used.
     */
    getQuote(fromAsset: Asset, toAsset: Asset, amount: string, sourceAddress?: string): Promise<QuoteResponse>;
    private getQuoteViaApi;
    /**
     * Fallback: simulate aggregator contract call via Soroban RPC.
     * Contract ID and invoke signature are from research; exact method name may vary.
     * If the aggregator exposes a view (e.g. get_amounts_out), we build a read-only invoke and parse result.
     * Uses sourceAddress for getAccount when valid; otherwise a valid fallback (previous literal had invalid checksum).
     */
    private getQuoteViaContract;
    /**
     * Execute a swap: build (from quote), sign with fromSecret, submit via Soroban RPC.
     */
    executeSwap(fromSecret: string, quote: QuoteResponse, network: Network): Promise<{
        hash: string;
        status: string;
    }>;
}
//# sourceMappingURL=soroSwapClient.d.ts.map