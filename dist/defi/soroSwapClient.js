"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoroSwapClient = exports.TESTNET_ASSETS = exports.QuoteResponseSchema = exports.AssetSchema = void 0;
const zod_1 = require("zod");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const stellar_sdk_2 = require("@stellar/stellar-sdk");
const networks_js_1 = require("../config/networks.js");
const nativeAmmClient_js_1 = require("./nativeAmmClient.js");
const ContractIdSchema = zod_1.z.object({
    contractId: zod_1.z.string().regex(/^C[A-Z2-7]{55}$/, "Invalid Soroban contract ID (C...)"),
});
const ClassicAssetSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    issuer: zod_1.z.string().min(56),
});
exports.AssetSchema = zod_1.z.union([ContractIdSchema, ClassicAssetSchema]);
/** Convert Asset to API string: contract ID or "CODE:ISSUER". */
function assetToApiString(asset) {
    if ("contractId" in asset && asset.contractId)
        return asset.contractId;
    return `${asset.code}:${asset.issuer}`;
}
function hasContractId(asset) {
    return "contractId" in asset && !!asset.contractId;
}
exports.QuoteResponseSchema = zod_1.z.object({
    expectedIn: zod_1.z.string(),
    expectedOut: zod_1.z.string(),
    minOut: zod_1.z.string(),
    route: zod_1.z.array(zod_1.z.string()),
    rawData: zod_1.z.unknown().optional(),
});
// ---------------------------------------------------------------------------
// SoroSwap contract IDs (research)
// ---------------------------------------------------------------------------
const SOROSWAP_AGGREGATOR_TESTNET = "CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD";
const SOROSWAP_AGGREGATOR_MAINNET = "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH";
/** Valid G address for simulation source (previous "system" account had invalid checksum). */
const SIMULATION_SOURCE_FALLBACK = "GBZOFW7UOPKDWHMFZT4IMUDNAHIM4KMABHTOKEJYFFYCOXLARMMSBLBE";
/** Testnet: XLM (wrapped contract ID); AUSDC = classic testnet USDC with liquidity on SoroSwap. */
exports.TESTNET_ASSETS = {
    XLM: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    /** Classic testnet USDC (has liquidity). Use for testnet swaps. */
    AUSDC: {
        code: "AUSDC",
        issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    },
    /** Legacy testnet USDC contract (often no path); prefer AUSDC. */
    USDC: "CBBHRKEP5M3NUDRISGLJKGHDHX3DA2CN2AZBQY6WLVUJ7VNLGSKBDUCM",
};
// ---------------------------------------------------------------------------
// API base (SoroSwap Swap Route API)
// ---------------------------------------------------------------------------
const SOROSWAP_API_BASE = "https://api.soroswap.finance";
// ---------------------------------------------------------------------------
// SoroSwapClient
// ---------------------------------------------------------------------------
class SoroSwapClient {
    sorobanServer;
    networkConfig;
    apiKey;
    nativeAmmClient;
    constructor(networkConfig, apiKey) {
        this.networkConfig = networkConfig;
        this.sorobanServer = new stellar_sdk_2.rpc.Server(networkConfig.sorobanRpcUrl, {
            allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:"),
        });
        this.apiKey = apiKey ?? process.env.SOROSWAP_API_KEY;
        this.nativeAmmClient = new nativeAmmClient_js_1.NativeAmmClient(networkConfig);
    }
    /**
     * Get a swap quote: expected in/out, minOut, route.
     * Uses SoroSwap aggregator: first tries REST API (if API key set), then falls back to
     * simulating an aggregator contract call via Soroban RPC (view-style invocation).
     * @param sourceAddress - Optional valid G address for contract simulation source; if invalid, a fallback is used.
     */
    async getQuote(fromAsset, toAsset, amount, sourceAddress) {
        const fromParsed = exports.AssetSchema.safeParse(fromAsset);
        const toParsed = exports.AssetSchema.safeParse(toAsset);
        if (!fromParsed.success) {
            throw new Error(`Invalid fromAsset: ${fromParsed.error.message}`);
        }
        if (!toParsed.success) {
            throw new Error(`Invalid toAsset: ${toParsed.error.message}`);
        }
        const amountStr = String(amount).trim();
        if (!amountStr || !/^\d+$/.test(amountStr)) {
            throw new Error("Amount must be a non-negative integer string (raw units)");
        }
        if (this.apiKey) {
            try {
                return await this.getQuoteViaApi(assetToApiString(fromParsed.data), assetToApiString(toParsed.data), amountStr);
            }
            catch (apiErr) {
                const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
                const isTestnet = this.networkConfig.horizonUrl.includes("testnet");
                // Try native AMM as fallback for testnet
                if (isTestnet && (msg.includes("Invalid Stellar address") || msg.includes("No path found") || msg.includes("No liquidity path found"))) {
                    try {
                        return await this.nativeAmmClient.getQuote(assetToApiString(fromParsed.data), assetToApiString(toParsed.data), amountStr);
                    }
                    catch (nativeErr) {
                        // If native AMM also fails, throw a helpful combined message
                        throw new Error(`No liquidity available via SoroSwap or Stellar AMM for this pair on testnet. Try different assets or amounts.`);
                    }
                }
                if (isTestnet &&
                    hasContractId(fromParsed.data) &&
                    hasContractId(toParsed.data) &&
                    (msg.includes("invalid checksum") || msg.includes("invalid encoded"))) {
                    return this.getQuoteViaContract({ contractId: fromParsed.data.contractId }, { contractId: toParsed.data.contractId }, amountStr, sourceAddress);
                }
                throw apiErr;
            }
        }
        if (!hasContractId(fromParsed.data) || !hasContractId(toParsed.data)) {
            throw new Error("Classic assets (e.g. AUSDC) require SOROSWAP_API_KEY for quotes. Set it for testnet XLM/AUSDC swaps.");
        }
        return this.getQuoteViaContract({ contractId: fromParsed.data.contractId }, { contractId: toParsed.data.contractId }, amountStr, sourceAddress);
    }
    async getQuoteViaApi(assetIn, assetOut, amount) {
        const network = this.networkConfig.horizonUrl.includes("testnet") ? "testnet" : "mainnet";
        const url = `${SOROSWAP_API_BASE}/quote?network=${network}`;
        const body = {
            assetIn,
            assetOut,
            amount,
            tradeType: "EXACT_IN",
            protocols: ["soroswap", "phoenix", "aqua"],
        };
        const headers = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) {
            headers["Authorization"] = `Bearer ${this.apiKey}`;
        }
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            if (res.status === 400 && text.includes("No path found")) {
                throw new Error("No liquidity path found for this pair on this network. Try a different pair or amount, or try again later.");
            }
            let message = `SoroSwap API error ${res.status}: ${text}`;
            if (res.status === 403) {
                message =
                    "SoroSwap API 403: check SOROSWAP_API_KEY (Bearer sk_...) and base URL.";
            }
            throw new Error(message);
        }
        const data = (await res.json());
        const parsedQuote = parseApiQuoteToQuoteResponse(data);
        return parsedQuote;
    }
    /**
     * Fallback: simulate aggregator contract call via Soroban RPC.
     * Contract ID and invoke signature are from research; exact method name may vary.
     * If the aggregator exposes a view (e.g. get_amounts_out), we build a read-only invoke and parse result.
     * Uses sourceAddress for getAccount when valid; otherwise a valid fallback (previous literal had invalid checksum).
     */
    async getQuoteViaContract(fromAsset, toAsset, amount, sourceAddress) {
        if (!fromAsset.contractId || !toAsset.contractId) {
            throw new Error("Contract path requires contract IDs. Classic assets (AUSDC) need SOROSWAP_API_KEY.");
        }
        if (!stellar_sdk_1.StrKey.isValidContract(fromAsset.contractId)) {
            throw new Error(`Invalid token contract ID (from): checksum or format error. Got: ${fromAsset.contractId.slice(0, 12)}...`);
        }
        if (!stellar_sdk_1.StrKey.isValidContract(toAsset.contractId)) {
            throw new Error(`Invalid token contract ID (to): checksum or format error. Got: ${toAsset.contractId.slice(0, 12)}...`);
        }
        const contractId = this.networkConfig.horizonUrl.includes("testnet")
            ? SOROSWAP_AGGREGATOR_TESTNET
            : SOROSWAP_AGGREGATOR_MAINNET;
        const contract = new stellar_sdk_1.Contract(contractId);
        const fromAddr = new stellar_sdk_1.Address(fromAsset.contractId);
        const toAddr = new stellar_sdk_1.Address(toAsset.contractId);
        const amountScVal = (0, stellar_sdk_1.nativeToScVal)(amount, { type: "i128" });
        // Common DEX pattern: get_amounts_out(amount_in, path[]). Path = [from, to].
        // SoroSwap router may use different name; adjust when docs are available.
        const pathScVal = stellar_sdk_1.xdr.ScVal.scvVec([
            (0, stellar_sdk_1.nativeToScVal)(fromAddr),
            (0, stellar_sdk_1.nativeToScVal)(toAddr),
        ]);
        const op = contract.call("get_amounts_out", amountScVal, pathScVal);
        const networkPassphrase = this.networkConfig.horizonUrl.includes("testnet")
            ? stellar_sdk_1.Networks.TESTNET
            : stellar_sdk_1.Networks.PUBLIC;
        const simSource = sourceAddress?.trim() && stellar_sdk_1.StrKey.isValidEd25519PublicKey(sourceAddress.trim())
            ? sourceAddress.trim()
            : SIMULATION_SOURCE_FALLBACK;
        let sourceAccount;
        try {
            sourceAccount = await this.sorobanServer.getAccount(simSource);
        }
        catch (getAccErr) {
            const m = getAccErr instanceof Error ? getAccErr.message : String(getAccErr);
            throw new Error(`Quote simulation needs a funded account. ${m}. Set SOROSWAP_API_KEY for API-based quotes.`);
        }
        const tx = new stellar_sdk_1.TransactionBuilder(sourceAccount, {
            fee: "10000",
            networkPassphrase,
        })
            .addOperation(op)
            .setTimeout(30)
            .build();
        let sim;
        try {
            sim = await this.sorobanServer.simulateTransaction(tx);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const useApi = "Quote via contract is not available. Set SOROSWAP_API_KEY for API-based quotes.";
            if (msg.includes("MismatchingParameterLen") || msg.includes("UnexpectedSize")) {
                throw new Error(useApi);
            }
            throw new Error(`SoroSwap quote simulation failed: ${msg}. ${useApi}`);
        }
        if ("error" in sim && sim.error) {
            const errStr = JSON.stringify(sim.error);
            const useApi = "Set SOROSWAP_API_KEY for API-based quotes.";
            if (errStr.includes("MismatchingParameterLen") ||
                errStr.includes("UnexpectedSize")) {
                throw new Error(`Quote via contract not supported for this aggregator. ${useApi}`);
            }
            throw new Error(`SoroSwap quote simulation error: ${errStr}. ${useApi}`);
        }
        const result = sim;
        const retvalB64 = result?.result?.retval;
        if (!retvalB64) {
            throw new Error("SoroSwap quote: no retval in simulation. Use SOROSWAP_API_KEY for API quotes.");
        }
        const retval = stellar_sdk_1.xdr.ScVal.fromXDR(retvalB64, "base64");
        const vec = retval.vec();
        if (!vec || vec.length < 2) {
            throw new Error("SoroSwap quote: unexpected contract return format. Use SOROSWAP_API_KEY for API quotes.");
        }
        const amountInVal = vec[0];
        const amountOutVal = vec[1];
        const expectedIn = scValToI128String(amountInVal);
        const expectedOut = scValToI128String(amountOutVal);
        const route = [fromAsset.contractId, toAsset.contractId];
        return exports.QuoteResponseSchema.parse({
            expectedIn,
            expectedOut,
            minOut: expectedOut,
            route,
        });
    }
    /**
     * Execute a swap: build (from quote), sign with fromSecret, submit via Soroban RPC.
     */
    async executeSwap(fromSecret, quote, network) {
        const secret = fromSecret.trim();
        if (secret.length === 56 && secret.startsWith("G")) {
            throw new Error("Expected a secret key (S...) to execute the swap, but received a public address (G...). For a quote only, do not provide a secret key.");
        }
        const config = (0, networks_js_1.getNetworkConfig)(network);
        const server = new stellar_sdk_2.rpc.Server(config.sorobanRpcUrl, {
            allowHttp: config.sorobanRpcUrl.startsWith("http:"),
        });
        const keypair = stellar_sdk_1.Keypair.fromSecret(secret);
        const fromAddress = keypair.publicKey();
        if (!this.apiKey) {
            throw new Error("executeSwap requires SoroSwap API to build the transaction. Set SOROSWAP_API_KEY.");
        }
        const networkName = config.horizonUrl.includes("testnet") ? "testnet" : "mainnet";
        const buildUrl = `${SOROSWAP_API_BASE}/quote/build?network=${networkName}`;
        // Use original API data if available, otherwise fall back to simplified quote
        const quoteForBuild = quote.rawData || quote;
        const buildBody = {
            quote: quoteForBuild,
            from: fromAddress,
            to: fromAddress,
        };
        const buildRes = await fetch(buildUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(buildBody),
        });
        if (!buildRes.ok) {
            const text = await buildRes.text();
            throw new Error(`SoroSwap build failed ${buildRes.status}: ${text}`);
        }
        const buildData = (await buildRes.json());
        const xdrBase64 = buildData?.xdr;
        if (!xdrBase64 || typeof xdrBase64 !== "string") {
            throw new Error("SoroSwap build response missing xdr");
        }
        const networkPassphrase = config.horizonUrl.includes("testnet")
            ? stellar_sdk_1.Networks.TESTNET
            : stellar_sdk_1.Networks.PUBLIC;
        const tx = stellar_sdk_1.TransactionBuilder.fromXDR(xdrBase64, networkPassphrase);
        tx.sign(keypair);
        const sendResult = await server.sendTransaction(tx);
        if (sendResult.errorResult) {
            throw new Error(`Soroban sendTransaction failed: ${String(sendResult.errorResult)}`);
        }
        return {
            hash: sendResult.hash,
            status: sendResult.status ?? "PENDING",
        };
    }
}
exports.SoroSwapClient = SoroSwapClient;
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseApiQuoteToQuoteResponse(data) {
    const o = data;
    const expectedIn = String(o?.expectedIn ?? o?.amountIn ?? "0");
    const expectedOut = String(o?.expectedOut ?? o?.amountOut ?? "0");
    const minOut = String(o?.minOut ?? o?.minimumAmountOut ?? expectedOut);
    const route = Array.isArray(o?.route)
        ? o.route
        : Array.isArray(o?.path)
            ? o.path
            : [];
    return exports.QuoteResponseSchema.parse({
        expectedIn,
        expectedOut,
        minOut,
        route,
        rawData: data, // Preserve original API response
    });
}
function scValToI128String(scv) {
    const iv = scv.i128?.() ?? scv.value?.();
    if (!iv)
        return "0";
    const lo = typeof iv.lo === "function" ? iv.lo()?.toString() : String(iv.lo ?? 0);
    const hi = typeof iv.hi === "function" ? iv.hi()?.toString() : String(iv.hi ?? 0);
    if (hi === "0" || hi === "undefined")
        return lo;
    try {
        return (BigInt(hi) * (1n << 64n) + BigInt(lo)).toString();
    }
    catch {
        return lo;
    }
}
//# sourceMappingURL=soroSwapClient.js.map