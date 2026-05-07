"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ALLBRIDGE_CORE_STELLAR_DOCS: () => ALLBRIDGE_CORE_STELLAR_DOCS,
  BAND_ORACLE: () => BAND_ORACLE,
  BLEND_POOLS: () => BLEND_POOLS,
  BLEND_POOLS_MAINNET: () => BLEND_POOLS_MAINNET,
  FXDAO_MAINNET: () => FXDAO_MAINNET,
  MAINNET_ASSETS: () => MAINNET_ASSETS,
  McpEnvSchema: () => McpEnvSchema,
  REFLECTOR_ORACLE: () => REFLECTOR_ORACLE,
  SOROSWAP_AGGREGATOR: () => SOROSWAP_AGGREGATOR,
  SoroSwapEnvSchema: () => SoroSwapEnvSchema,
  StellarAgentKit: () => StellarAgentKit,
  StellarEnvSchema: () => StellarEnvSchema,
  TESTNET_ASSETS: () => TESTNET_ASSETS,
  X402EnvSchema: () => X402EnvSchema,
  createDexClient: () => createDexClient,
  createReflectorOracle: () => createReflectorOracle,
  getNetworkConfig: () => getNetworkConfig,
  lendingBorrow: () => lendingBorrow,
  lendingRepay: () => lendingRepay,
  lendingSupply: () => lendingSupply,
  lendingWithdraw: () => lendingWithdraw,
  networks: () => networks,
  validateMcpEnv: () => validateMcpEnv,
  validateStellarEnv: () => validateStellarEnv,
  validateX402Env: () => validateX402Env
});
module.exports = __toCommonJS(index_exports);

// src/agent.ts
var import_stellar_sdk5 = require("@stellar/stellar-sdk");

// src/config/networks.ts
var import_zod = require("zod");
var NetworkConfigSchema = import_zod.z.object({
  network: import_zod.z.enum(["mainnet", "testnet"]),
  horizonUrl: import_zod.z.string().url(),
  sorobanRpcUrl: import_zod.z.string().url(),
  friendbotUrl: import_zod.z.string().url().optional()
});
var mainnet = {
  network: "mainnet",
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm"
};
var testnet = {
  network: "testnet",
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  friendbotUrl: "https://friendbot.stellar.org"
};
var networks = { mainnet, testnet };
function getNetworkConfig(name = "mainnet") {
  if (name === "testnet") return testnet;
  return mainnet;
}

// src/dex/soroSwap.ts
var import_stellar_sdk = require("@stellar/stellar-sdk");
var import_stellar_sdk2 = require("@stellar/stellar-sdk");
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
    const url = `${SOROSWAP_API_BASE}/quote?network=${networkConfig.horizonUrl.includes("testnet") ? "testnet" : "mainnet"}`;
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
    const keypair = import_stellar_sdk.Keypair.fromSecret(secretKey.trim());
    const fromAddress = keypair.publicKey();
    const buildUrl = `${SOROSWAP_API_BASE}/quote/build?network=${networkConfig.horizonUrl.includes("testnet") ? "testnet" : "mainnet"}`;
    const buildRes = await fetch(buildUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ quote: quote.rawData ?? quote, from: fromAddress, to: fromAddress })
    });
    if (!buildRes.ok) throw new Error(`SoroSwap build failed ${buildRes.status}: ${await buildRes.text()}`);
    const buildData = await buildRes.json();
    const xdrBase64 = buildData?.xdr;
    if (!xdrBase64 || typeof xdrBase64 !== "string") throw new Error("SoroSwap build response missing xdr");
    const config = getNetworkConfig(networkConfig.horizonUrl.includes("testnet") ? "testnet" : "mainnet");
    const networkPassphrase = networkConfig.horizonUrl.includes("testnet") ? import_stellar_sdk.Networks.TESTNET : import_stellar_sdk.Networks.PUBLIC;
    const tx = import_stellar_sdk.TransactionBuilder.fromXDR(xdrBase64, networkPassphrase);
    tx.sign(keypair);
    const server = new import_stellar_sdk2.rpc.Server(config.sorobanRpcUrl, { allowHttp: config.sorobanRpcUrl.startsWith("http:") });
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
var import_stellar_sdk3 = require("@stellar/stellar-sdk");

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
var SIMULATION_SOURCE_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
function assetToScVal(asset) {
  if ("contractId" in asset && asset.contractId) {
    const addr = new import_stellar_sdk3.Address(asset.contractId);
    return import_stellar_sdk3.xdr.ScVal.scvVec([
      import_stellar_sdk3.xdr.ScVal.scvSymbol("Stellar"),
      import_stellar_sdk3.xdr.ScVal.scvAddress(addr.toScAddress())
    ]);
  }
  if ("symbol" in asset && asset.symbol) {
    return import_stellar_sdk3.xdr.ScVal.scvVec([
      import_stellar_sdk3.xdr.ScVal.scvSymbol("Other"),
      import_stellar_sdk3.xdr.ScVal.scvSymbol(asset.symbol)
    ]);
  }
  throw new Error("Oracle asset must be { contractId } or { symbol }");
}
function parseLastPriceRetval(retvalInput, decimals) {
  const retval = typeof retvalInput === "string" ? import_stellar_sdk3.xdr.ScVal.fromXDR(retvalInput, "base64") : retvalInput;
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
  const server = new import_stellar_sdk3.rpc.Server(config.networkConfig.sorobanRpcUrl, {
    allowHttp: config.networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const networkPassphrase = import_stellar_sdk3.Networks.PUBLIC;
  async function decimals() {
    const contract = new import_stellar_sdk3.Contract(contractId);
    const op = contract.call("decimals");
    const acc = await server.getAccount(SIMULATION_SOURCE_MAINNET);
    const tx = new import_stellar_sdk3.TransactionBuilder(acc, {
      fee: "10000",
      networkPassphrase
    }).addOperation(op).setTimeout(30).build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = sim?.result?.retval;
    if (ret == null) throw new Error("No decimals retval");
    const val = typeof ret === "string" ? import_stellar_sdk3.xdr.ScVal.fromXDR(ret, "base64") : ret;
    const u = val.u32();
    return u ?? 7;
  }
  async function lastprice(asset) {
    const contract = new import_stellar_sdk3.Contract(contractId);
    const assetScVal = assetToScVal(asset);
    const op = contract.call("lastprice", assetScVal);
    const acc = await server.getAccount(SIMULATION_SOURCE_MAINNET);
    const tx = new import_stellar_sdk3.TransactionBuilder(acc, {
      fee: "10000",
      networkPassphrase
    }).addOperation(op).setTimeout(30).build();
    const sim = await server.simulateTransaction(tx);
    if ("error" in sim && sim.error) throw new Error(String(sim.error));
    const ret = sim?.result?.retval;
    if (ret == null) throw new Error("Oracle lastprice: no retval");
    const dec = await decimals();
    return parseLastPriceRetval(ret, dec);
  }
  return { lastprice, decimals, contractId };
}

// src/lending/blend.ts
var import_stellar_sdk4 = require("@stellar/stellar-sdk");
var import_blend_sdk = require("@blend-capital/blend-sdk");
var BLEND_POOLS_MAINNET = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS";
var BLEND_POOLS = { mainnet: BLEND_POOLS_MAINNET };
async function buildSubmitTx(networkConfig, secretKey, poolId, requests) {
  const keypair = import_stellar_sdk4.Keypair.fromSecret(secretKey.trim());
  const user = keypair.publicKey();
  const pool = new import_blend_sdk.PoolContractV2(poolId);
  const submitOpXdr = pool.submit({
    from: user,
    spender: user,
    to: user,
    requests
  });
  const op = import_stellar_sdk4.xdr.Operation.fromXDR(submitOpXdr, "base64");
  const networkPassphrase = networkConfig.network === "testnet" ? import_stellar_sdk4.Networks.TESTNET : import_stellar_sdk4.Networks.PUBLIC;
  const horizon = new import_stellar_sdk4.Server(networkConfig.horizonUrl);
  const sourceAccount = await horizon.loadAccount(user);
  const tx = new import_stellar_sdk4.TransactionBuilder(sourceAccount, {
    fee: "10000",
    networkPassphrase
  }).addOperation(op).setTimeout(180).build();
  return { tx, keypair };
}
async function lendingSupply(networkConfig, secretKey, args) {
  const amountBigInt = BigInt(args.amount);
  const requests = [
    {
      request_type: import_blend_sdk.RequestType.SupplyCollateral,
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
  const server = new import_stellar_sdk4.rpc.Server(networkConfig.sorobanRpcUrl, {
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
      request_type: import_blend_sdk.RequestType.Borrow,
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
  const server = new import_stellar_sdk4.rpc.Server(networkConfig.sorobanRpcUrl, {
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
async function lendingWithdraw(networkConfig, secretKey, args) {
  const amountBigInt = BigInt(args.amount);
  const requests = [
    {
      request_type: import_blend_sdk.RequestType.WithdrawCollateral,
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
  const server = new import_stellar_sdk4.rpc.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend withdraw failed: ${String(sendResult.errorResult)}`);
  }
  return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
}
async function lendingRepay(networkConfig, secretKey, args) {
  const amountBigInt = BigInt(args.amount);
  const requests = [
    {
      request_type: import_blend_sdk.RequestType.Repay,
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
  const server = new import_stellar_sdk4.rpc.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:")
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend repay failed: ${String(sendResult.errorResult)}`);
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
    this.keypair = import_stellar_sdk5.Keypair.fromSecret(secretKey.trim());
    this.network = network;
    this.config = getNetworkConfig(network);
  }
  /**
   * Initialize clients (Horizon, Soroban RPC, protocol wrappers).
   * Call after construction before using protocol methods.
   */
  async initialize() {
    this._horizon = new import_stellar_sdk5.Server(this.config.horizonUrl);
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
  // ─── Account & balances ────────────────────────────────────────────────────
  /**
   * Get balances for an account (native + trustlines).
   * @param accountId - Stellar account ID (G...); defaults to this agent's public key
   * @returns List of balances: asset code, issuer (if not native), balance string, and optional limit
   */
  async getBalances(accountId) {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");
    const id = accountId ?? this.keypair.publicKey();
    const account = await this._horizon.loadAccount(id);
    const balances = account.balances;
    return balances.map((b) => ({
      assetCode: b.asset_code === "native" ? "XLM" : b.asset_code,
      issuer: b.asset_issuer,
      balance: b.balance,
      limit: b.limit
    }));
  }
  /**
   * Create a new Stellar account (funding from this agent's account).
   * @param destination - New account's public key (G...)
   * @param startingBalance - Amount of XLM to send (e.g. "1" for 1 XLM; minimum ~1 XLM for base reserve)
   * @returns Transaction hash
   */
  async createAccount(destination, startingBalance) {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");
    const networkPassphrase = this.network === "testnet" ? import_stellar_sdk5.Networks.TESTNET : import_stellar_sdk5.Networks.PUBLIC;
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());
    const tx = new import_stellar_sdk5.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase
    }).addOperation(import_stellar_sdk5.Operation.createAccount({ destination, startingBalance })).setTimeout(180).build();
    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
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
    const networkPassphrase = this.network === "testnet" ? import_stellar_sdk5.Networks.TESTNET : import_stellar_sdk5.Networks.PUBLIC;
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());
    const asset = assetCode && assetIssuer ? new import_stellar_sdk5.Asset(assetCode, assetIssuer) : import_stellar_sdk5.Asset.native();
    const tx = new import_stellar_sdk5.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase
    }).addOperation(import_stellar_sdk5.Operation.payment({ destination: to, asset, amount })).setTimeout(180).build();
    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
  }
  /**
   * Path payment (strict receive): send up to sendMax of sendAsset so destination receives exactly destAmount of destAsset.
   * @param sendAsset - Asset to send (native or { code, issuer })
   * @param sendMax - Maximum amount of sendAsset to send (display units)
   * @param destination - Recipient account (G...)
   * @param destAsset - Asset the recipient receives
   * @param destAmount - Exact amount of destAsset the recipient gets (display units)
   * @param path - Optional intermediate assets for the path
   */
  async pathPayment(sendAsset, sendMax, destination, destAsset, destAmount, path = []) {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");
    const send = sendAsset.assetCode === "XLM" && !sendAsset.issuer ? import_stellar_sdk5.Asset.native() : new import_stellar_sdk5.Asset(sendAsset.assetCode, sendAsset.issuer || "");
    const dest = destAsset.assetCode === "XLM" && !destAsset.issuer ? import_stellar_sdk5.Asset.native() : new import_stellar_sdk5.Asset(destAsset.assetCode, destAsset.issuer || "");
    const pathAssets = path.map(
      (p) => p.assetCode === "XLM" && !p.issuer ? import_stellar_sdk5.Asset.native() : new import_stellar_sdk5.Asset(p.assetCode, p.issuer || "")
    );
    const networkPassphrase = this.network === "testnet" ? import_stellar_sdk5.Networks.TESTNET : import_stellar_sdk5.Networks.PUBLIC;
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());
    const tx = new import_stellar_sdk5.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase
    }).addOperation(
      import_stellar_sdk5.Operation.pathPaymentStrictReceive({
        sendAsset: send,
        sendMax,
        destination,
        destAsset: dest,
        destAmount,
        path: pathAssets
      })
    ).setTimeout(180).build();
    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
  }
  // ─── Trustlines ────────────────────────────────────────────────────────────
  /**
   * Create or modify a trustline for a custom asset.
   * Required before an account can hold or receive non-native assets.
   * @param assetCode - Asset code (e.g. "USDC")
   * @param assetIssuer - Issuer account (G...)
   * @param limit - Optional maximum balance to trust; defaults to max ("922337203685.4775807")
   * @returns Transaction hash
   */
  async createTrustline(assetCode, assetIssuer, limit) {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");
    const networkPassphrase = this.network === "testnet" ? import_stellar_sdk5.Networks.TESTNET : import_stellar_sdk5.Networks.PUBLIC;
    const asset = new import_stellar_sdk5.Asset(assetCode, assetIssuer);
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());
    const tx = new import_stellar_sdk5.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase
    }).addOperation(import_stellar_sdk5.Operation.changeTrust({ asset, ...limit !== void 0 && { limit } })).setTimeout(180).build();
    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
  }
  /**
   * Remove a trustline for a custom asset (sets limit to "0").
   * The account's balance for that asset must be zero before removal.
   * @param assetCode - Asset code (e.g. "USDC")
   * @param assetIssuer - Issuer account (G...)
   * @returns Transaction hash
   */
  async removeTrustline(assetCode, assetIssuer) {
    return this.createTrustline(assetCode, assetIssuer, "0");
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
  /**
   * Withdraw collateral from a Blend pool.
   */
  async lendingWithdraw(args) {
    this.ensureInitialized();
    return lendingWithdraw(this.config, this.keypair.secret(), args);
  }
  /**
   * Repay a borrowed asset to a Blend pool.
   */
  async lendingRepay(args) {
    this.ensureInitialized();
    return lendingRepay(this.config, this.keypair.secret(), args);
  }
};

// src/config/assets.ts
var MAINNET_ASSETS = {
  XLM: { contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA" },
  USDC: { contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75" }
};
var TESTNET_ASSETS = {
  XLM: { contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" },
  USDC: { contractId: "CBBHRKEP5M3NUDRISGLJKGHDHX3DA2CN2AZBQY6WLVUJ7VNLGSKBDUCM" }
};
var SOROSWAP_AGGREGATOR = "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH";

// src/config/protocols.ts
var FXDAO_MAINNET = {
  vaults: "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB",
  lockingPool: "CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP",
  usdx: "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  eurx: "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U",
  gbpx: "CBCO65UOWXY2GR66GOCMCN6IU3Y45TXCPBY3FLUNL4AOUMOCKVIVV6JC",
  fxg: "CDBR4FMYL5WPUDBIXTBEBU2AFEYTDLXVOTRZHXS3JC575C7ZQRKYZQ55",
  oracle: "CB5OTV4GV24T5USEZHFVYGC3F4A4MPUQ3LN56E76UK2IT7MJ6QXW4TFS"
};
var ALLBRIDGE_CORE_STELLAR_DOCS = "https://docs-core.allbridge.io/sdk/guides/stellar";

// src/config/env.ts
var import_zod2 = require("zod");
var stellarSecretKeyRegex = /^S[A-Z2-7]{55}$/;
var stellarPublicKeyRegex = /^G[A-Z2-7]{55}$/;
var StellarEnvSchema = import_zod2.z.object({
  SECRET_KEY: import_zod2.z.string({ required_error: "SECRET_KEY is required" }).regex(
    stellarSecretKeyRegex,
    "SECRET_KEY must be a valid Stellar secret key starting with S (56 chars)"
  )
});
var X402EnvSchema = import_zod2.z.object({
  X402_DESTINATION: import_zod2.z.string({ required_error: "X402_DESTINATION is required" }).regex(
    stellarPublicKeyRegex,
    "X402_DESTINATION must be a valid Stellar public key starting with G (56 chars)"
  )
});
var SoroSwapEnvSchema = import_zod2.z.object({
  SOROSWAP_API_KEY: import_zod2.z.string({ required_error: "SOROSWAP_API_KEY is required" }).min(1, "SOROSWAP_API_KEY cannot be empty")
});
var McpEnvSchema = import_zod2.z.object({
  SECRET_KEY: import_zod2.z.string({ required_error: "SECRET_KEY is required for execute_swap" }).regex(
    stellarSecretKeyRegex,
    "SECRET_KEY must be a valid Stellar secret key starting with S (56 chars)"
  ),
  SOROSWAP_API_KEY: import_zod2.z.string({ required_error: "SOROSWAP_API_KEY is required" }).min(1, "SOROSWAP_API_KEY cannot be empty")
});
function validateStellarEnv(env = process.env) {
  const result = StellarEnvSchema.safeParse(env);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join("\n");
    throw new Error(
      `StellarAgentKit startup failed \u2014 missing or invalid env vars:
${messages}`
    );
  }
  return result.data;
}
function validateX402Env(env = process.env) {
  const result = X402EnvSchema.safeParse(env);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join("\n");
    throw new Error(
      `x402-stellar-sdk startup failed \u2014 missing or invalid env vars:
${messages}`
    );
  }
  return result.data;
}
function validateMcpEnv(env = process.env) {
  const result = McpEnvSchema.safeParse(env);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    return { success: false, error: messages };
  }
  return { success: true, data: result.data };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLBRIDGE_CORE_STELLAR_DOCS,
  BAND_ORACLE,
  BLEND_POOLS,
  BLEND_POOLS_MAINNET,
  FXDAO_MAINNET,
  MAINNET_ASSETS,
  McpEnvSchema,
  REFLECTOR_ORACLE,
  SOROSWAP_AGGREGATOR,
  SoroSwapEnvSchema,
  StellarAgentKit,
  StellarEnvSchema,
  TESTNET_ASSETS,
  X402EnvSchema,
  createDexClient,
  createReflectorOracle,
  getNetworkConfig,
  lendingBorrow,
  lendingRepay,
  lendingSupply,
  lendingWithdraw,
  networks,
  validateMcpEnv,
  validateStellarEnv,
  validateX402Env
});
//# sourceMappingURL=index.cjs.map