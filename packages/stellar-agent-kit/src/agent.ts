/**
 * StellarAgentKit – unified DeFi agent (MNTAgentKit-style API for Stellar).
 * Constructor(secretKey, network) + initialize() then protocol methods.
 */

import { Keypair, Asset, TransactionBuilder, Operation, Networks, Horizon } from "@stellar/stellar-sdk";
import { getNetworkConfig, type NetworkConfig } from "./config/networks.js";
import { createDexClient, type DexAsset, type QuoteResult, type SwapResult } from "./dex/index.js";
import { createReflectorOracle, type OracleAsset, type PriceData } from "./oracle/index.js";
import { lendingSupply as blendSupply, lendingBorrow as blendBorrow, type LendingSupplyArgs, type LendingBorrowArgs, type LendingResult } from "./lending/index.js";

/** This project is mainnet-only. */
export type StellarNetwork = "mainnet";

export class StellarAgentKit {
  public readonly keypair: Keypair;
  public readonly network: StellarNetwork;
  public readonly config: NetworkConfig;
  private _initialized = false;
  private _dex: ReturnType<typeof createDexClient> | null = null;
  private _horizon: Horizon.Server | null = null;
  private _oracle: ReturnType<typeof createReflectorOracle> | null = null;

  constructor(secretKey: string, network: StellarNetwork = "mainnet") {
    if (network !== "mainnet") {
      throw new Error("This project is mainnet-only. Use network: 'mainnet'.");
    }
    this.keypair = Keypair.fromSecret(secretKey.trim());
    this.network = "mainnet";
    this.config = getNetworkConfig();
  }

  /**
   * Initialize clients (Horizon, Soroban RPC, protocol wrappers).
   * Call after construction before using protocol methods.
   */
  async initialize(): Promise<this> {
    this._horizon = new Horizon.Server(this.config.horizonUrl);
    this._dex = createDexClient(this.config, process.env.SOROSWAP_API_KEY);
    this._oracle = createReflectorOracle({ networkConfig: this.config });
    this._initialized = true;
    return this;
  }

  private ensureInitialized(): void {
    if (!this._initialized || !this._dex) {
      throw new Error("StellarAgentKit not initialized. Call await agent.initialize() first.");
    }
  }

  // ─── DEX Operations (mirror Mantle agniSwap / executeSwap) ─────────────────

  /**
   * Get a swap quote (exact-in). Uses SoroSwap aggregator (SoroSwap, Phoenix, Aqua).
   */
  async dexGetQuote(
    fromAsset: DexAsset,
    toAsset: DexAsset,
    amount: string
  ): Promise<QuoteResult> {
    this.ensureInitialized();
    return this._dex!.getQuote(fromAsset, toAsset, amount);
  }

  /**
   * Execute a swap using a prior quote.
   */
  async dexSwap(quote: QuoteResult): Promise<SwapResult> {
    this.ensureInitialized();
    return this._dex!.executeSwap(this.keypair.secret(), quote);
  }

  /**
   * One-shot: get quote and execute swap (convenience).
   */
  async dexSwapExactIn(
    fromAsset: DexAsset,
    toAsset: DexAsset,
    amount: string
  ): Promise<SwapResult> {
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
  async sendPayment(
    to: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string
  ): Promise<{ hash: string }> {
    this.ensureInitialized();
    if (!this._horizon) throw new Error("Horizon not initialized");

    const networkPassphrase = Networks.PUBLIC;
    const sourceAccount = await this._horizon.loadAccount(this.keypair.publicKey());

    const asset =
      assetCode && assetIssuer
        ? new Asset(assetCode, assetIssuer)
        : Asset.native();

    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(Operation.payment({ destination: to, asset, amount }))
      .setTimeout(180)
      .build();

    tx.sign(this.keypair);
    const result = await this._horizon.submitTransaction(tx);
    return { hash: result.hash };
  }

  // ─── Oracle (Reflector SEP-40) ─────────────────────────────────────────────

  /**
   * Get latest price for an asset from Reflector oracle.
   * @param asset - { contractId: "C..." } for on-chain token or { symbol: "XLM" } for ticker
   */
  async getPrice(asset: OracleAsset): Promise<PriceData> {
    this.ensureInitialized();
    if (!this._oracle) throw new Error("Oracle not initialized");
    return this._oracle.lastprice(asset);
  }

  // ─── Lending (Blend) ───────────────────────────────────────────────────────

  /**
   * Supply (deposit) an asset to a Blend pool.
   */
  async lendingSupply(args: LendingSupplyArgs): Promise<LendingResult> {
    this.ensureInitialized();
    return blendSupply(this.config, this.keypair.secret(), args);
  }

  /**
   * Borrow an asset from a Blend pool.
   */
  async lendingBorrow(args: LendingBorrowArgs): Promise<LendingResult> {
    this.ensureInitialized();
    return blendBorrow(this.config, this.keypair.secret(), args);
  }
}
