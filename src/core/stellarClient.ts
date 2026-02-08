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
    const normalized = address.trim();
    if (!StrKey.isValidEd25519PublicKey(normalized)) {
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
