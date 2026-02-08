/**
 * SoroSwap DEX client – quote via API, build + sign + submit for executeSwap.
 */

import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks.js";
import { getNetworkConfig } from "../config/networks.js";
import type { DexAsset, QuoteResult, SwapResult } from "./types.js";

const SOROSWAP_API_BASE = "https://api.soroswap.finance";

function assetToApiString(asset: DexAsset): string {
  if (asset.contractId) return asset.contractId;
  if (asset.code && asset.issuer) return `${asset.code}:${asset.issuer}`;
  throw new Error("Asset must have contractId or code+issuer");
}

function parseApiQuote(data: unknown): QuoteResult {
  const o = data as Record<string, unknown>;
  return {
    expectedIn: String(o?.expectedIn ?? o?.amountIn ?? "0"),
    expectedOut: String(o?.expectedOut ?? o?.amountOut ?? "0"),
    minOut: String(o?.minOut ?? o?.minimumAmountOut ?? o?.expectedOut ?? "0"),
    route: Array.isArray(o?.route) ? (o.route as string[]) : Array.isArray(o?.path) ? (o.path as string[]) : [],
    rawData: data,
  };
}

export function createSoroSwapDexClient(
  networkConfig: NetworkConfig,
  apiKey?: string
): { getQuote: (from: DexAsset, to: DexAsset, amount: string) => Promise<QuoteResult>; executeSwap: (secretKey: string, quote: QuoteResult) => Promise<SwapResult> } {
  const key = apiKey ?? process.env.SOROSWAP_API_KEY;

  async function getQuote(from: DexAsset, to: DexAsset, amount: string): Promise<QuoteResult> {
    const url = `${SOROSWAP_API_BASE}/quote?network=mainnet`;
    const body = {
      assetIn: assetToApiString(from),
      assetOut: assetToApiString(to),
      amount: String(amount).trim(),
      tradeType: "EXACT_IN",
      protocols: ["soroswap", "phoenix", "aqua"],
    };
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (key) headers["Authorization"] = `Bearer ${key}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SoroSwap quote failed ${res.status}: ${text}`);
    }
    return parseApiQuote(await res.json());
  }

  async function executeSwap(secretKey: string, quote: QuoteResult): Promise<SwapResult> {
    if (!key) throw new Error("executeSwap requires SOROSWAP_API_KEY");
    const keypair = Keypair.fromSecret(secretKey.trim());
    const fromAddress = keypair.publicKey();
    const buildUrl = `${SOROSWAP_API_BASE}/quote/build?network=mainnet`;
    const buildRes = await fetch(buildUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ quote: quote.rawData ?? quote, from: fromAddress, to: fromAddress }),
    });
    if (!buildRes.ok) throw new Error(`SoroSwap build failed ${buildRes.status}: ${await buildRes.text()}`);
    const buildData = (await buildRes.json()) as { xdr?: string };
    const xdrBase64 = buildData?.xdr;
    if (!xdrBase64 || typeof xdrBase64 !== "string") throw new Error("SoroSwap build response missing xdr");
    const config = getNetworkConfig("mainnet");
    const networkPassphrase = Networks.PUBLIC;
    const tx = TransactionBuilder.fromXDR(xdrBase64, networkPassphrase);
    tx.sign(keypair);
    const server = new rpc.Server(config.sorobanRpcUrl, { allowHttp: config.sorobanRpcUrl.startsWith("http:") });
    const sendResult = await server.sendTransaction(tx);
    if (sendResult.errorResult) throw new Error(`Soroban sendTransaction failed: ${String(sendResult.errorResult)}`);
    return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
  }

  return { getQuote, executeSwap };
}
