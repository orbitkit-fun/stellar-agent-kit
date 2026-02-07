import {
  Keypair,
  Operation,
  TransactionBuilder,
  Asset,
  BASE_FEE,
  Networks,
  Horizon,
  StrKey,
} from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks.js";
import { z } from "zod";

type HorizonServer = InstanceType<typeof Horizon.Server>;
type BalanceLine = Horizon.HorizonApi.BalanceLine;
type SubmitTransactionResponse = Horizon.HorizonApi.SubmitTransactionResponse;

const StellarAddressSchema = z
  .string()
  .min(56)
  .max(56)
  .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar public key (G...)");

const SecretKeySchema = z
  .string()
  .min(56)
  .max(56)
  .regex(/^S[A-Z2-7]{55}$/, "Invalid Stellar secret key (S...)");

const AmountSchema = z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a positive number");

export interface BalanceEntry {
  code: string;
  issuer: string | null;
  balance: string;
}

/**
 * Stellar client for account queries and payment submission.
 * Uses Horizon for classic operations (balance, payments).
 */
export class StellarClient {
  private readonly server: HorizonServer;
  private readonly config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.server = new Horizon.Server(config.horizonUrl);
  }

  /**
   * Fetch all balances for an account (XLM + trust lines).
   */
  async getBalance(address: string): Promise<BalanceEntry[]> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d1882c5-dc48-494c-98b8-3a0080ef9d74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stellarClient.ts:getBalance',message:'address validation entry',data:{originalAddress:address,originalLen:address?.length,addressAfterTrim:address?.trim?.(),trimmedLen:address?.trim?.()?.length},hypothesisId:'H1',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const normalized = address.trim();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d1882c5-dc48-494c-98b8-3a0080ef9d74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stellarClient.ts:getBalance',message:'StrKey validation',data:{normalized,normalizedLen:normalized?.length,startsWithG:normalized?.startsWith?.('G'),isValidResult:StrKey.isValidEd25519PublicKey(normalized)},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!StrKey.isValidEd25519PublicKey(normalized)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3d1882c5-dc48-494c-98b8-3a0080ef9d74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stellarClient.ts:getBalance',message:'StrKey validation failed',data:{normalized,reason:'StrKey.isValidEd25519PublicKey returned false'},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(
        "Stellar address has invalid checksum or format. Check for typos or extra spaces; use a 56-character key starting with G."
      );
    }
    const parsed = StellarAddressSchema.safeParse(normalized);
    if (!parsed.success) {
      throw new Error(parsed.error.errors.map((e) => e.message).join("; "));
    }

    const networkLabel = this.config.horizonUrl.includes("testnet") ? "testnet" : "mainnet";
    const account = await this.server
      .accounts()
      .accountId(parsed.data)
      .call()
      .catch((err: unknown) => {
        const res = err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response
          : undefined;
        if (res?.status === 404) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3d1882c5-dc48-494c-98b8-3a0080ef9d74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stellarClient.ts:getBalance',message:'Horizon 404',data:{address,network:networkLabel},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          throw new Error(
            `Account not found on ${networkLabel}: ${address}. If you use mainnet, ask for balance "on mainnet". New accounts must be funded first.`
          );
        }
        throw err;
      });

    const balances: BalanceEntry[] = account.balances.map((b: BalanceLine) => {
      if (b.asset_type === "native") {
        return {
          code: "XLM",
          issuer: null,
          balance: b.balance,
        };
      }
      const asset = b as Horizon.HorizonApi.BalanceLineAsset;
      return {
        code: asset.asset_code,
        issuer: asset.asset_issuer ?? null,
        balance: asset.balance,
      };
    });

    return balances;
  }

  /**
   * Send a payment (XLM or custom asset).
   * @param fromSecret - Secret key of sender (S...)
   * @param to - Destination public key (G...)
   * @param amount - Amount as string (e.g. "100" or "10.5")
   * @param assetCode - Optional; if omitted, sends XLM
   * @param assetIssuer - Required when assetCode is set (issuer G...)
   */
  async sendPayment(
    fromSecret: string,
    to: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string
  ): Promise<SubmitTransactionResponse> {
    const secretParsed = SecretKeySchema.safeParse(fromSecret);
    if (!secretParsed.success) {
      throw new Error(secretParsed.error.errors.map((e) => e.message).join("; "));
    }
    const toParsed = StellarAddressSchema.safeParse(to);
    if (!toParsed.success) {
      throw new Error(toParsed.error.errors.map((e) => e.message).join("; "));
    }
    const amountParsed = AmountSchema.safeParse(amount);
    if (!amountParsed.success) {
      throw new Error(amountParsed.error.errors.map((e) => e.message).join("; "));
    }

    const sourceKeypair = Keypair.fromSecret(secretParsed.data);
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

    const asset =
      assetCode && assetIssuer
        ? new Asset(assetCode, assetIssuer)
        : Asset.native();

    const op = Operation.payment({
      destination: toParsed.data,
      asset,
      amount: amountParsed.data,
    });

    const networkPassphrase = this.config.horizonUrl.includes("testnet")
      ? Networks.TESTNET
      : Networks.PUBLIC;

    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    tx.sign(sourceKeypair);

    return await this.server.submitTransaction(tx);
  }
}
