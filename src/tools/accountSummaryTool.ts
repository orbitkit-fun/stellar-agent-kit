import { z } from "zod";
import { getNetworkConfig } from "../config/networks.js";
import { Horizon } from "@stellar/stellar-sdk";

/* ------------------------------------------------------------------ */
/*  Zod schemas – consistent with stellarClient.ts validation style   */
/* ------------------------------------------------------------------ */

const StellarAddressSchema = z
  .string()
  .min(56)
  .max(56)
  .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar public key (G...)");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Sanitised operation record returned to the caller / LLM. */
export interface OperationSummary {
  id: string;
  type: string;
  createdAt: string;
  successful: boolean;
  /** Extra fields depend on `type`. */
  [key: string]: unknown;
}

export interface AccountSummaryResult {
  success: true;
  address: string;
  network: string;
  operationsCount: number;
  history: OperationSummary[];
}

/* ------------------------------------------------------------------ */
/*  User-friendly error mapping                                        */
/* ------------------------------------------------------------------ */

/** Maps raw Horizon / network errors to clear, actionable messages. */
function toUserFriendlyError(error: unknown, address: string, network: string): Error {
  const msg = error instanceof Error ? error.message : String(error);

  // 404 – account does not exist on the chosen network
  if (
    msg.includes("404") ||
    msg.toLowerCase().includes("not found") ||
    (typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404)
  ) {
    return new Error(
      `Bu hesap henüz ${network} ağında aktif değil. ` +
        `Hesabın fonlanmış ve ağda kayıtlı olduğundan emin olun. Adres: ${address}`
    );
  }

  // Network / timeout
  if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("fetch failed")) {
    return new Error(
      `Stellar ${network} ağına bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`
    );
  }

  // Rate-limit (429)
  if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
    return new Error(
      "Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin."
    );
  }

  // Fallback
  return new Error(`Hesap geçmişi alınamadı: ${msg}`);
}

/* ------------------------------------------------------------------ */
/*  Operation → human-readable mapper                                  */
/* ------------------------------------------------------------------ */

function mapOperation(op: Record<string, unknown>): OperationSummary {
  const base: OperationSummary = {
    id: String(op.id ?? ""),
    type: String(op.type ?? "unknown"),
    createdAt: String(op.created_at ?? ""),
    successful: op.transaction_successful === true,
  };

  switch (op.type) {
    case "payment":
      base.from = op.from;
      base.to = op.to;
      base.amount = op.amount;
      base.asset =
        op.asset_type === "native"
          ? "XLM"
          : `${op.asset_code}:${String(op.asset_issuer ?? "").slice(0, 8)}…`;
      break;

    case "create_account":
      base.funder = op.funder;
      base.account = op.account;
      base.startingBalance = op.starting_balance;
      break;

    case "change_trust":
      base.trustor = op.trustor;
      base.asset =
        op.asset_type === "native"
          ? "XLM"
          : `${op.asset_code}:${String(op.asset_issuer ?? "").slice(0, 8)}…`;
      base.limit = op.limit;
      break;

    case "path_payment_strict_receive":
    case "path_payment_strict_send":
      base.from = op.from;
      base.to = op.to;
      base.amount = op.amount;
      base.sourceAmount = op.source_amount;
      base.sourceAsset =
        op.source_asset_type === "native"
          ? "XLM"
          : `${op.source_asset_code}:${String(op.source_asset_issuer ?? "").slice(0, 8)}…`;
      base.destAsset =
        op.asset_type === "native"
          ? "XLM"
          : `${op.asset_code}:${String(op.asset_issuer ?? "").slice(0, 8)}…`;
      break;

    case "manage_sell_offer":
    case "manage_buy_offer":
    case "create_passive_sell_offer":
      base.offerId = op.offer_id ?? op.id;
      base.amount = op.amount;
      base.price = op.price;
      base.buyingAsset =
        op.buying_asset_type === "native"
          ? "XLM"
          : `${op.buying_asset_code}:${String(op.buying_asset_issuer ?? "").slice(0, 8)}…`;
      base.sellingAsset =
        op.selling_asset_type === "native"
          ? "XLM"
          : `${op.selling_asset_code}:${String(op.selling_asset_issuer ?? "").slice(0, 8)}…`;
      break;

    case "set_options":
      if (op.inflation_dest) base.inflationDest = op.inflation_dest;
      if (op.home_domain) base.homeDomain = op.home_domain;
      if (op.signer_key) base.signerKey = op.signer_key;
      break;

    case "account_merge":
      base.account = op.account;
      base.into = op.into;
      break;

    case "claim_claimable_balance":
      base.balanceId = op.balance_id;
      base.claimant = op.claimant;
      break;

    case "create_claimable_balance":
      base.sponsor = op.sponsor;
      base.amount = op.amount;
      base.asset =
        op.asset_type === "native"
          ? "XLM"
          : `${op.asset_code}:${String(op.asset_issuer ?? "").slice(0, 8)}…`;
      break;

    // For any other operation type, return only the base fields.
    default:
      break;
  }

  return base;
}

/* ------------------------------------------------------------------ */
/*  Tool definition (same shape as tools[] in agentTools.ts)           */
/* ------------------------------------------------------------------ */

export const getAccountSummaryTool = {
  name: "get_account_summary" as const,
  description:
    "Fetch recent operations history for a Stellar account. " +
    "Returns a human-readable summary of payments, trust-line changes, " +
    "offers, merges, claimable balances and more.",
  parameters: z.object({
    address: z.string().describe("Stellar public key (G...)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(10)
      .describe("Number of recent operations to return (1-50, default 10)"),
    network: z
      .enum(["mainnet", "testnet"])
      .optional()
      .default("mainnet")
      .describe("Network to query (mainnet or testnet)"),
  }),

  execute: async ({
    address,
    limit = 10,
    network = "mainnet",
  }: {
    address: string;
    limit?: number;
    network?: "mainnet" | "testnet";
  }): Promise<AccountSummaryResult> => {
    /* ---- Validate address with Zod ---- */
    const parsed = StellarAddressSchema.safeParse(address.trim());
    if (!parsed.success) {
      throw new Error(
        parsed.error.errors.map((e) => e.message).join("; ")
      );
    }

    /* ---- Resolve network config ---- */
    const config = getNetworkConfig(network);
    const server = new Horizon.Server(config.horizonUrl);

    /* ---- Fetch operations ---- */
    try {
      const safedLimit = Math.min(Math.max(limit, 1), 50);

      const operationsPage = await server
        .operations()
        .forAccount(parsed.data)
        .order("desc")
        .limit(safedLimit)
        .call();

      const history: OperationSummary[] = operationsPage.records.map(
        (op) => mapOperation(op as unknown as Record<string, unknown>)
      );

      return {
        success: true,
        address: parsed.data,
        network,
        operationsCount: history.length,
        history,
      };
    } catch (error) {
      throw toUserFriendlyError(error, parsed.data, network);
    }
  },
};
