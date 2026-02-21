/**
 * Minimal SoroSwap server-side helper: quote + build (no secret). User signs with Freighter; submit with signed XDR.
 */
import { TransactionBuilder, Networks, rpc } from "@stellar/stellar-sdk";
import { getNetworkConfig } from "stellar-agent-kit";

const SOROSWAP_API_BASE = "https://api.soroswap.finance";

export interface AssetInput {
  contractId?: string;
  code?: string;
  issuer?: string;
}

function assetToApiString(asset: AssetInput): string {
  if (asset.contractId) return asset.contractId;
  if (asset.code && asset.issuer) return `${asset.code}:${asset.issuer}`;
  throw new Error("Asset must have contractId or code+issuer");
}

export interface QuoteResponse {
  expectedIn: string;
  expectedOut: string;
  minOut: string;
  route: string[];
  rawData?: unknown;
}

function normalizeQuoteForBuild(quote: Record<string, unknown>): Record<string, unknown> {
  const out = { ...quote };
  if (typeof out.poolHashes === "string") delete out.poolHashes;
  if (typeof out.amountOut === "number") out.amountOut = String(out.amountOut);
  if (typeof out.otherAmountThreshold === "number") out.otherAmountThreshold = String(out.otherAmountThreshold);
  if (out.rawTrade && typeof out.rawTrade === "object") {
    const rt = out.rawTrade as Record<string, unknown>;
    const rtOut = { ...rt };
    if (typeof rtOut.amountOutMin === "number") rtOut.amountOutMin = String(rtOut.amountOutMin);
    if (typeof rtOut.poolHashes === "string") delete rtOut.poolHashes;
    out.rawTrade = rtOut;
  }
  return out;
}

export async function getQuote(
  fromAsset: AssetInput,
  toAsset: AssetInput,
  amount: string,
  apiKey?: string
): Promise<QuoteResponse> {
  const key = apiKey ?? process.env.SOROSWAP_API_KEY;
  const url = `${SOROSWAP_API_BASE}/quote?network=mainnet`;
  const body = {
    assetIn: assetToApiString(fromAsset),
    assetOut: assetToApiString(toAsset),
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
  const data = (await res.json()) as Record<string, unknown>;
  return {
    expectedIn: String(data?.expectedIn ?? data?.amountIn ?? "0"),
    expectedOut: String(data?.expectedOut ?? data?.amountOut ?? "0"),
    minOut: String(data?.minOut ?? data?.minimumAmountOut ?? data?.expectedOut ?? "0"),
    route: Array.isArray(data?.route) ? (data.route as string[]) : Array.isArray(data?.path) ? (data.path as string[]) : [],
    rawData: data,
  };
}

export async function buildSwapTransaction(
  quote: QuoteResponse,
  fromAddress: string,
  apiKey?: string
): Promise<{ xdr: string }> {
  const key = apiKey ?? process.env.SOROSWAP_API_KEY;
  if (!key) throw new Error("SOROSWAP_API_KEY is required to build swap. Set it in .env.");
  const buildUrl = `${SOROSWAP_API_BASE}/quote/build?network=mainnet`;
  const raw = (quote.rawData || quote) as Record<string, unknown>;
  const quoteForBuild = normalizeQuoteForBuild(raw);
  const buildRes = await fetch(buildUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ quote: quoteForBuild, from: fromAddress, to: fromAddress }),
  });
  if (!buildRes.ok) {
    const text = await buildRes.text();
    let message = text;
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      if (body.message === "TokenError.InsufficientBalance" || body.error === "Simulation Failed") {
        message = "Insufficient balance. Try a smaller amount or check your balance.";
      } else if (body.message) message = body.message;
    } catch {
      // keep text
    }
    throw new Error(`SoroSwap build failed: ${message}`);
  }
  const buildData = (await buildRes.json()) as { xdr?: string };
  if (!buildData?.xdr || typeof buildData.xdr !== "string") throw new Error("SoroSwap build response missing xdr");
  return { xdr: buildData.xdr };
}

export async function submitSignedTransaction(signedXdr: string): Promise<{ hash: string; status: string }> {
  const config = getNetworkConfig();
  const networkPassphrase = config.horizonUrl?.includes("testnet") ? Networks.TESTNET : Networks.PUBLIC;
  const server = new rpc.Server(config.sorobanRpcUrl, {
    allowHttp: config.sorobanRpcUrl.startsWith("http:"),
  });
  const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const result = await server.sendTransaction(tx);
  if (result.errorResult) throw new Error(`Soroban sendTransaction failed: ${String(result.errorResult)}`);
  return { hash: result.hash, status: result.status ?? "PENDING" };
}
