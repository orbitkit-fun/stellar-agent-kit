// src/agent.ts
import { Keypair as Keypair3, Asset, TransactionBuilder as TransactionBuilder4, Operation, Networks as Networks4, Horizon as Horizon2 } from "@stellar/stellar-sdk";

// src/config/networks.ts
import { z } from "zod";
var NetworkConfigSchema = z.object({
  horizonUrl: z.string().url(),
  sorobanRpcUrl: z.string().url(),
  friendbotUrl: z.string().url().optional()
});
var mainnet = {
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm"
};
var networks = { mainnet };
function getNetworkConfig(name) {
  if (name && name !== "mainnet") {
    throw new Error("This project is mainnet-only. Use network: 'mainnet'.");
  }
  return mainnet;
}

// src/dex/soroSwap.ts
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
var SOROSWAP_API_BASE = "https://api.soroswap.finance";
function assetToApiString(asset) {
  if (asset.contractId) return asset.contractId;
  if (asset.code && asset.issuer) return `${asset.code}:${asset.issuer}`;
  throw new Error("Asset must have contractId or code+issuer");
}
function parseApiQuote(data) {
  const o = data;
  return {
    expectedIn: String(o?.expectedIn ?? o?.amountIn ?? "0"),
    expectedOut: String(o?.expectedOut ?? o?.amountOut ?? "0"),
    minOut: String(o?.minOut ?? o?.minimumAmountOut ?? o?.expectedOut ?? "0"),
    route: Array.isArray(o?.route) ? o.route : Array.isArray(o?.path) ? o.path : [],
    rawData: data
  };
}
function createSoroSwapDexClient(networkConfig, apiKey) {
  const key = apiKey ?? process.env.SOROSWAP_API_KEY;
  async function getQuote(from, to, amount) {
    const url = `${SOROSWAP_API_BASE}/quote?network=mainnet`;
    const body = {
      assetIn: assetToApiString(from),
      assetOut: assetToApiString(to),
      amount: String(amount).trim(),
      tradeType: "EXACT_IN",
      protocols: ["soroswap", "phoenix", "aqua"]
    };
    const headers = { "Content-Type": "application/json" };
    if (key) headers["Authorization"] = `Bearer ${key}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SoroSwap quote failed ${res.status}: ${text}`);
    }
    return parseApiQuote(await res.json());
  }
  async function executeSwap(secretKey, quote) {
    if (!key) throw new Error("executeSwap requires SOROSWAP_API_KEY");
    const keypair = Keypair.fromSecret(secretKey.trim());
    const fromAddress = keypair.publicKey();
    const buildUrl = `${SOROSWAP_API_BASE}/quote/build?network=mainnet`;
    const buildRes = await fetch(buildUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ quote: quote.rawData ?? quote, from: fromAddress, to: fromAddress })
    });
    if (!buildRes.ok) throw new Error(`SoroSwap build failed ${buildRes.status}: ${await buildRes.text()}`);
    const buildData = await buildRes.json();
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

// src/dex/index.ts
function createDexClient(networkConfig, apiKey) {
  return createSoroSwapDexClient(networkConfig, apiKey);
}

// src/oracle/reflector.ts
import {
  Contract,
  Address,
  TransactionBuilder as TransactionBuilder2,
  Networks as Networks2,
  xdr,
  rpc as rpc2
} from "@stellar/stellar-sdk";

// src/config/oracles.ts
var REFLECTOR_ORACLE = {
  /** Stellar Mainnet DEX prices */
  dex: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M",
  /** External CEX & DEX rates */
  cexDex: "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN",
  /** Fiat exchange rates */
  fiat: "CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC"
};
var BAND_ORACLE = "CCQXWMZVM3KRTXTUPTN53YHL272QGKF32L7XEDNZ2S6OSUFK3NFBGG5M";

// src/oracle/reflector.ts
function assetToScVal(asset) {
  if ("contractId" in asset && asset.contractId) {
    const addr = new Address(asset.contractId);
    return xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Stellar"),
      xdr.ScVal.scvAddress(addr.toScAddress())
    ]);
  }
  if ("symbol" in asset && asset.symbol) {
    return xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Other"),
      xdr.ScVal.scvSymbol(asset.symbol)
    ]);
  }
  throw new Error("Oracle asset must be { contractId } or { symbol }");
}
function parseLastPriceRetval(retvalB64, decimals) {
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
function scValToI128(val) {
  const i128 = val.i128();
  if (!i128) throw new Error("Expected i128 price");
  const lo = i128.lo();
  const hi = i128.hi();
  if (!lo || hi === void 0) return "0";
  const loNum = Number(lo);
  const hiNum = Number(hi);
  const negative = hiNum < 0;
  const absLo = loNum < 0 ? 4294967296 + loNum : loNum;
  const absHi = hiNum < 0 ? 4294967296 + hiNum : hiNum;
  let n = BigInt(absLo) + (BigInt(absHi) << 32n);
  if (negative) n = -n;
  return String(n);
}
function createReflectorOracle(config) {
  const feed = config.feed ?? "dex";
  const contractId = REFLECTOR_ORACLE[feed];
  const server = new rpc2.Server(config.networkConfig.sorobanRpcUrl, {
    allowHttp: config.networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const networkPassphrase = Networks2.PUBLIC;
  async function decimals() {
    const contract = new Contract(contractId);
    const op = contract.call("decimals");
    const source = "GBZOFW7UOPKDWHMFZT4IMUDNAHIM4KMABHTOKEJYFFYCOXLARMMSBLBE";
    const acc = await server.getAccount(source);
    const tx = new TransactionBuilder2(acc, {
      fee: "10000",
      networkPassphrase
    }).addOperation(op).setTimeout(30).build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = sim?.result?.retval;
    if (!ret) throw new Error("No decimals retval");
    const val = xdr.ScVal.fromXDR(ret, "base64");
    const u = val.u32();
    return u ?? 7;
  }
  async function lastprice(asset) {
    const contract = new Contract(contractId);
    const assetScVal = assetToScVal(asset);
    const op = contract.call("lastprice", assetScVal);
    const source = "GBZOFW7UOPKDWHMFZT4IMUDNAHIM4KMABHTOKEJYFFYCOXLARMMSBLBE";
    const acc = await server.getAccount(source);
    const tx = new TransactionBuilder2(acc, {
      fee: "10000",
      networkPassphrase
    }).addOperation(op).setTimeout(30).build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = sim?.result?.retval;
    if (!ret) throw new Error("Oracle lastprice: no retval");
    const dec = await decimals();
    return parseLastPriceRetval(ret, dec);
  }
  return { lastprice, decimals, contractId };
}

// src/lending/blend.ts
import {
  Keypair as Keypair2,
  TransactionBuilder as TransactionBuilder3,
  Networks as Networks3,
  xdr as xdr2,
  rpc as rpc3,
  Horizon
} from "@stellar/stellar-sdk";
import { PoolContractV2, RequestType } from "@blend-capital/blend-sdk";
var BLEND_POOLS_MAINNET = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS";
var BLEND_POOLS = { mainnet: BLEND_POOLS_MAINNET };
async function buildSubmitTx(networkConfig, secretKey, poolId, requests) {
  const keypair = Keypair2.fromSecret(secretKey.trim());
  const user = keypair.publicKey();
  const pool = new PoolContractV2(poolId);
  const submitOpXdr = pool.submit({
    from: user,
    spender: user,
    to: user,
    requests
  });
  const op = xdr2.Operation.fromXDR(submitOpXdr, "base64");
  const networkPassphrase = Networks3.PUBLIC;
  const horizon = new Horizon.Server(networkConfig.horizonUrl);
  const sourceAccount = await horizon.loadAccount(user);
  const tx = new TransactionBuilder3(sourceAccount, {
    fee: "10000",
    networkPassphrase
  }).addOperation(op).setTimeout(180).build();
  return { tx, keypair };
}
async function lendingSupply(networkConfig, secretKey, args) {
  const amountBigInt = BigInt(args.amount);
  const requests = [
    {
      request_type: RequestType.SupplyCollateral,
      address: args.assetContractId,
      amount: amountBigInt
    }
  ];
  const { tx, keypair } = await buildSubmitTx(
    networkConfig,
    secretKey,
    args.poolId,
    requests
  );
  const server = new rpc3.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend supply failed: ${String(sendResult.errorResult)}`);
  }
  return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
}
async function lendingBorrow(networkConfig, secretKey, args) {
  const amountBigInt = BigInt(args.amount);
  const requests = [
    {
      request_type: RequestType.Borrow,
      address: args.assetContractId,
      amount: amountBigInt
    }
  ];
  const { tx, keypair } = await buildSubmitTx(
    networkConfig,
    secretKey,
    args.poolId,
    requests
  );
  const server = new rpc3.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend borrow failed: ${String(sendResult.errorResult)}`);
  }
  return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
}

// src/agent.ts
var StellarAgentKit = class {
  keypair;
  network;
  config;
  _initialized = false;
  _dex = null;
  _horizon = null;
  _oracle = null;
  constructor(secretKey, network = "mainnet") {
    if (network !== "mainnet") {
      throw new Error("This project is mainnet-only. Use network: 'mainnet'.");
    }
    this.keypair = Keypair3.fromSecret(secretKey.trim());
    this.network = "mainnet";
    this.config = getNetworkConfig();
  }
  /**
   * Initialize clients (Horizon, Soroban RPC, protocol wrappers).
   * Call after construction before using protocol methods.
   */
  async initialize() {
    this._horizon = new Horizon2.Server(this.config.horizonUrl);
    this._dex = createDexClient(this.config, process.env.SOROSWAP_API_KEY);
    this._oracle = createReflectorOracle({ networkConfig: this.config });
    this._initialized = true;
    return this;
  }
  ensureInitialized() {
    if (!this._initialized || !this._dex) {
      throw new Error("StellarAgentKit not initialized. Call await agent.initialize() first.");
    }
  }
  // ─── DEX Operations (mirror Mantle agniSwap / executeSwap) ─────────────────
  /**
   * Get a swap quote (exact-in). Uses SoroSwap aggregator (SoroSwap, Phoenix, Aqua).
   */
  async dexGetQuote(fromAsset, toAsset, amount) {
    this.ensureInitialized();
    return this._dex.getQuote(fromAsset, toAsset, amount);
  }
  /**
   * Execute a swap using a prior quote.
   */
  async dexSwap(quote) {
    this.ensureInitialized();
    return this._dex.executeSwap(this.keypair.secret(), quote);
  }
  /**
   * One-shot: get quote and execute swap (convenience).
   */
  async dexSwapExactIn(fromAsset, toAsset, amount) {
    const quote = await this.dexGetQuote(fromAsset, toAsset, amount);
    return this.dexSwap(quote);
  }
  // ─── Payments (Horizon) ────────────────────────────────────────────────────
  /**
   * Send a native or custom-asset payment (Horizon).
   * @param to - Destination account (G...)
   * @param amount - Amount in display units (e.g. "10" for 10 XLM)
   * @param assetCode - Optional; omit for native XLM
   * @param assetIssuer - Optional; required if assetCode is set
   */
  async sendPayment(to, amount, assetCode, assetIssuer) {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");
    const networkPassphrase = Networks4.PUBLIC;
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());
    const asset = assetCode && assetIssuer ? new Asset(assetCode, assetIssuer) : Asset.native();
    const tx = new TransactionBuilder4(sourceAccount, {
      fee: "100",
      networkPassphrase
    }).addOperation(Operation.payment({ destination: to, asset, amount })).setTimeout(180).build();
    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
  }
  // ─── Oracle (Reflector SEP-40) ─────────────────────────────────────────────
  /**
   * Get latest price for an asset from Reflector oracle.
   * @param asset - { contractId: "C..." } for on-chain token or { symbol: "XLM" } for ticker
   */
  async getPrice(asset) {
    this.ensureInitialized();
    if (!this._oracle) throw new Error("Oracle not initialized");
    return this._oracle.lastprice(asset);
  }
  // ─── Lending (Blend) ───────────────────────────────────────────────────────
  /**
   * Supply (deposit) an asset to a Blend pool.
   */
  async lendingSupply(args) {
    this.ensureInitialized();
    return lendingSupply(this.config, this.keypair.secret(), args);
  }
  /**
   * Borrow an asset from a Blend pool.
   */
  async lendingBorrow(args) {
    this.ensureInitialized();
    return lendingBorrow(this.config, this.keypair.secret(), args);
  }
};

// src/config/assets.ts
var MAINNET_ASSETS = {
  XLM: { contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA" },
  USDC: { contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75" }
};
var SOROSWAP_AGGREGATOR = "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH";
export {
  BAND_ORACLE,
  BLEND_POOLS,
  BLEND_POOLS_MAINNET,
  MAINNET_ASSETS,
  REFLECTOR_ORACLE,
  SOROSWAP_AGGREGATOR,
  StellarAgentKit,
  createDexClient,
  createReflectorOracle,
  getNetworkConfig,
  lendingBorrow,
  lendingSupply,
  networks
};
//# sourceMappingURL=index.js.map