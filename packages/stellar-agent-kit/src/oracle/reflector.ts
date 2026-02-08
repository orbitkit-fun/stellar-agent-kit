/**
 * Reflector oracle client – SEP-40 price feeds on Stellar.
 * Uses lastprice(asset) for current price. Asset = Stellar(Address) | Other(Symbol).
 * Contract IDs: https://developers.stellar.org/docs/data/oracles/oracle-providers
 */

import {
  Contract,
  Address,
  TransactionBuilder,
  Networks,
  xdr,
  rpc,
} from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks.js";

import { REFLECTOR_ORACLE } from "../config/oracles.js";

/** Either a Soroban token contract ID (C...) or a ticker symbol (e.g. "XLM", "BTC") for off-chain feeds. */
export type OracleAsset = { contractId: string } | { symbol: string };

export interface PriceData {
  price: string;
  timestamp: number;
  decimals: number;
}

/**
 * Build SEP-40 Asset ScVal: Stellar(Address) or Other(Symbol).
 */
function assetToScVal(asset: OracleAsset): xdr.ScVal {
  if ("contractId" in asset && asset.contractId) {
    const addr = new Address(asset.contractId);
    return xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Stellar"),
      xdr.ScVal.scvAddress(addr.toScAddress()),
    ]);
  }
  if ("symbol" in asset && asset.symbol) {
    return xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Other"),
      xdr.ScVal.scvSymbol(asset.symbol),
    ]);
  }
  throw new Error("Oracle asset must be { contractId } or { symbol }");
}

/**
 * Parse lastprice result: Option<PriceData> -> PriceData.
 * Option = vec 0 or 1 element. PriceData = struct as vec [price, timestamp] (unnamed) or map.
 */
function parseLastPriceRetval(retvalB64: string, decimals: number): PriceData {
  const retval = xdr.ScVal.fromXDR(retvalB64, "base64");
  const vec = retval.vec();
  if (!vec || vec.length === 0) {
    throw new Error("Oracle returned no price (None) for this asset");
  }
  const inner = vec[0];
  const dataVec = inner.vec();
  if (dataVec && dataVec.length >= 2) {
    const price = scValToI128(dataVec[0]);
    const timestamp = Number(dataVec[1].u64()?.toString() ?? 0);
    return { price, timestamp, decimals };
  }
  const m = inner.map();
  if (m) {
    for (const entry of m) {
      const k = entry.key();
      const v = entry.val();
      if (k.sym && k.sym().toString() === "price" && v) {
        const price = scValToI128(v);
        let timestamp = 0;
        for (const e2 of m) {
          if (e2.key().sym && e2.key().sym().toString() === "timestamp") {
            timestamp = Number(e2.val().u64()?.toString() ?? 0);
            break;
          }
        }
        return { price, timestamp, decimals };
      }
    }
  }
  throw new Error("Oracle price data format unexpected");
}

function scValToI128(val: xdr.ScVal): string {
  const i128 = val.i128();
  if (!i128) throw new Error("Expected i128 price");
  const lo = i128.lo();
  const hi = i128.hi();
  if (!lo || hi === undefined) return "0";
  const loNum = Number(lo);
  const hiNum = Number(hi);
  const negative = hiNum < 0;
  const absLo = loNum < 0 ? 0x100000000 + loNum : loNum;
  const absHi = hiNum < 0 ? 0x100000000 + hiNum : hiNum;
  let n = BigInt(absLo) + (BigInt(absHi) << 32n);
  if (negative) n = -n;
  return String(n);
}

export interface ReflectorOracleConfig {
  networkConfig: NetworkConfig;
  /** Which feed: DEX (default), CEX/DEX, or Fiat. */
  feed?: "dex" | "cexDex" | "fiat";
}

export function createReflectorOracle(config: ReflectorOracleConfig) {
  const feed = config.feed ?? "dex";
  const contractId = REFLECTOR_ORACLE[feed];
  const server = new rpc.Server(config.networkConfig.sorobanRpcUrl, {
    allowHttp: config.networkConfig.sorobanRpcUrl.startsWith("http:"),
  });
  const networkPassphrase = Networks.PUBLIC;

  async function decimals(): Promise<number> {
    const contract = new Contract(contractId);
    const op = contract.call("decimals");
    const source = "GBZOFW7UOPKDWHMFZT4IMUDNAHIM4KMABHTOKEJYFFYCOXLARMMSBLBE";
    const acc = await server.getAccount(source);
    const tx = new TransactionBuilder(acc, {
      fee: "10000",
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = (sim as { result?: { retval?: string } })?.result?.retval;
    if (!ret) throw new Error("No decimals retval");
    const val = xdr.ScVal.fromXDR(ret, "base64");
    const u = val.u32();
    return u ?? 7;
  }

  async function lastprice(asset: OracleAsset): Promise<PriceData> {
    const contract = new Contract(contractId);
    const assetScVal = assetToScVal(asset);
    const op = contract.call("lastprice", assetScVal);
    const source = "GBZOFW7UOPKDWHMFZT4IMUDNAHIM4KMABHTOKEJYFFYCOXLARMMSBLBE";
    const acc = await server.getAccount(source);
    const tx = new TransactionBuilder(acc, {
      fee: "10000",
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = (sim as { result?: { retval?: string } })?.result?.retval;
    if (!ret) throw new Error("Oracle lastprice: no retval");
    const dec = await decimals();
    return parseLastPriceRetval(ret, dec);
  }

  return { lastprice, decimals, contractId };
}

export type ReflectorOracle = ReturnType<typeof createReflectorOracle>;
