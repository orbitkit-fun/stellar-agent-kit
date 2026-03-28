/**
 * Portfolio Tracker & Transaction History module for Stellar Agent Kit
 * 
 * Provides portfolio tracking, transaction history, payment history,
 * and portfolio analytics for Stellar accounts.
 */

import { Horizon } from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks.js";
import type {
  PortfolioAsset,
  PortfolioSummary,
  TransactionRecord,
  PaymentRecord,
  TransactionHistoryOptions,
  PaymentHistoryOptions,
  PortfolioChange,
  PortfolioSnapshot,
} from "./types.js";

export type {
  PortfolioAsset,
  PortfolioSummary,
  TransactionRecord,
  PaymentRecord,
  TransactionHistoryOptions,
  PaymentHistoryOptions,
  PortfolioChange,
  PortfolioSnapshot,
} from "./types.js";

export interface PortfolioTracker {
  getPortfolio(accountId: string): Promise<PortfolioSummary>;
  getTransactionHistory(accountId: string, options?: TransactionHistoryOptions): Promise<TransactionRecord[]>;
  getPaymentHistory(accountId: string, options?: PaymentHistoryOptions): Promise<PaymentRecord[]>;
  takeSnapshot(accountId: string): Promise<PortfolioSnapshot>;
  compareSnapshots(previous: PortfolioSnapshot, current: PortfolioSnapshot): PortfolioChange[];
}

/**
 * Create a portfolio tracker instance
 */
export function createPortfolioTracker(networkConfig: NetworkConfig): PortfolioTracker {
  const horizon = new Horizon.Server(networkConfig.horizonUrl);

  return {
    /**
     * Get full portfolio summary for an account
     */
    async getPortfolio(accountId: string): Promise<PortfolioSummary> {
      const account = await horizon.loadAccount(accountId);

      const assets: PortfolioAsset[] = [];
      let nativeBalance = "0";

      for (const bal of account.balances as any[]) {
        if (bal.asset_type === "native") {
          nativeBalance = bal.balance;
          assets.push({
            assetCode: "XLM",
            balance: bal.balance,
          });
        } else {
          assets.push({
            assetCode: bal.asset_code,
            issuer: bal.asset_issuer,
            balance: bal.balance,
            limit: bal.limit,
          });
        }
      }

      const trustlineCount = assets.filter(a => a.assetCode !== "XLM").length;

      return {
        accountId,
        totalValueUsd: 0, // Requires oracle integration for full valuation
        assets,
        nativeBalance,
        nativeValueUsd: 0,
        trustlineCount,
        lastUpdated: Date.now(),
      };
    },

    /**
     * Get transaction history for an account
     */
    async getTransactionHistory(
      accountId: string,
      options: TransactionHistoryOptions = {}
    ): Promise<TransactionRecord[]> {
      const { limit = 20, cursor, order = "desc", includeFailed = false } = options;

      let builder = horizon
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order(order);

      if (cursor) {
        builder = builder.cursor(cursor);
      }

      if (includeFailed) {
        builder = builder.includeFailed(true);
      }

      const response = await builder.call();

      return response.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        ledger: tx.ledger_attr,
        createdAt: tx.created_at,
        sourceAccount: tx.source_account,
        feeCharged: tx.fee_charged,
        operationCount: tx.operation_count,
        memo: tx.memo,
        memoType: tx.memo_type,
        successful: tx.successful,
      }));
    },

    /**
     * Get payment history for an account
     */
    async getPaymentHistory(
      accountId: string,
      options: PaymentHistoryOptions = {}
    ): Promise<PaymentRecord[]> {
      const { limit = 20, cursor, order = "desc" } = options;

      let builder = horizon
        .payments()
        .forAccount(accountId)
        .limit(limit)
        .order(order);

      if (cursor) {
        builder = builder.cursor(cursor);
      }

      const response = await builder.call();

      const payments: PaymentRecord[] = [];

      for (const record of response.records as any[]) {
        if (
          record.type === "payment" ||
          record.type === "create_account" ||
          record.type === "path_payment_strict_receive" ||
          record.type === "path_payment_strict_send"
        ) {
          let assetCode = "XLM";
          let assetIssuer: string | undefined;
          let amount = "0";
          let from = record.source_account || "";
          let to = "";

          if (record.type === "create_account") {
            amount = record.starting_balance || "0";
            to = record.account || "";
          } else if (record.type === "payment") {
            assetCode = record.asset_type === "native" ? "XLM" : record.asset_code;
            assetIssuer = record.asset_issuer;
            amount = record.amount || "0";
            from = record.from || record.source_account || "";
            to = record.to || "";
          } else {
            // path_payment variants
            assetCode = record.asset_type === "native" ? "XLM" : record.asset_code;
            assetIssuer = record.asset_issuer;
            amount = record.amount || "0";
            from = record.from || record.source_account || "";
            to = record.to || "";
          }

          const paymentType = record.type === "path_payment_strict_receive"
            ? "path_payment"
            : record.type as PaymentRecord["type"];

          payments.push({
            id: record.id,
            transactionHash: record.transaction_hash,
            type: paymentType,
            from,
            to,
            assetCode,
            assetIssuer,
            amount,
            createdAt: record.created_at,
          });
        }
      }

      return payments;
    },

    /**
     * Take a snapshot of current portfolio state
     */
    async takeSnapshot(accountId: string): Promise<PortfolioSnapshot> {
      const portfolio = await this.getPortfolio(accountId);

      return {
        accountId,
        timestamp: Date.now(),
        assets: portfolio.assets.map(a => ({
          assetCode: a.assetCode,
          balance: a.balance,
          issuer: a.issuer,
        })),
      };
    },

    /**
     * Compare two portfolio snapshots to detect changes
     */
    compareSnapshots(
      previous: PortfolioSnapshot,
      current: PortfolioSnapshot
    ): PortfolioChange[] {
      const changes: PortfolioChange[] = [];

      // Build lookup from previous snapshot
      const prevMap = new Map<string, string>();
      for (const asset of previous.assets) {
        const key = asset.issuer ? `${asset.assetCode}:${asset.issuer}` : asset.assetCode;
        prevMap.set(key, asset.balance);
      }

      // Compare with current
      for (const asset of current.assets) {
        const key = asset.issuer ? `${asset.assetCode}:${asset.issuer}` : asset.assetCode;
        const prevBalance = prevMap.get(key) || "0";
        const currentBalance = asset.balance;

        const prev = parseFloat(prevBalance);
        const curr = parseFloat(currentBalance);
        const change = curr - prev;

        if (change !== 0) {
          changes.push({
            assetCode: asset.assetCode,
            previousBalance: prevBalance,
            currentBalance: currentBalance,
            change: change.toFixed(7),
            changePercent: prev !== 0 ? Math.round((change / prev) * 10000) / 100 : curr > 0 ? 100 : 0,
          });
        }

        prevMap.delete(key);
      }

      // Assets that were in previous but not in current (fully removed)
      for (const [key, balance] of prevMap) {
        const assetCode = key.includes(":") ? key.split(":")[0] : key;
        changes.push({
          assetCode,
          previousBalance: balance,
          currentBalance: "0",
          change: (-parseFloat(balance)).toFixed(7),
          changePercent: -100,
        });
      }

      return changes;
    },
  };
}

/**
 * Format portfolio summary as human-readable string (useful for CLI/agent output)
 */
export function formatPortfolioSummary(portfolio: PortfolioSummary): string {
  const lines: string[] = [
    `Portfolio for ${portfolio.accountId.slice(0, 8)}...${portfolio.accountId.slice(-4)}`,
    `──────────────────────────────────────`,
    `Native (XLM): ${portfolio.nativeBalance}`,
    `Trustlines: ${portfolio.trustlineCount}`,
    ``,
    `Assets:`,
  ];

  for (const asset of portfolio.assets) {
    if (asset.assetCode === "XLM") continue;
    lines.push(`  ${asset.assetCode}: ${asset.balance}${asset.limit ? ` (limit: ${asset.limit})` : ""}`);
  }

  lines.push(``, `Last updated: ${new Date(portfolio.lastUpdated).toISOString()}`);
  return lines.join("\n");
}

/**
 * Format transaction history as human-readable string
 */
export function formatTransactionHistory(transactions: TransactionRecord[]): string {
  if (transactions.length === 0) return "No transactions found.";

  const lines: string[] = [
    `Transaction History (${transactions.length} records)`,
    `──────────────────────────────────────`,
  ];

  for (const tx of transactions) {
    const status = tx.successful ? "✓" : "✗";
    lines.push(
      `${status} ${tx.hash.slice(0, 12)}... | ${tx.createdAt} | ${tx.operationCount} ops | fee: ${tx.feeCharged} stroops`
    );
  }

  return lines.join("\n");
}

/**
 * Format payment history as human-readable string
 */
export function formatPaymentHistory(payments: PaymentRecord[]): string {
  if (payments.length === 0) return "No payments found.";

  const lines: string[] = [
    `Payment History (${payments.length} records)`,
    `──────────────────────────────────────`,
  ];

  for (const p of payments) {
    const direction = p.type === "create_account" ? "CREATE" : "PAY";
    lines.push(
      `${direction} ${p.amount} ${p.assetCode} | ${p.from.slice(0, 8)}... → ${p.to.slice(0, 8)}... | ${p.createdAt}`
    );
  }

  return lines.join("\n");
}

/**
 * Format portfolio changes as human-readable string
 */
export function formatPortfolioChanges(changes: PortfolioChange[]): string {
  if (changes.length === 0) return "No portfolio changes detected.";

  const lines: string[] = [
    `Portfolio Changes`,
    `──────────────────────────────────────`,
  ];

  for (const c of changes) {
    const sign = parseFloat(c.change) >= 0 ? "+" : "";
    lines.push(
      `${c.assetCode}: ${c.previousBalance} → ${c.currentBalance} (${sign}${c.change}, ${sign}${c.changePercent}%)`
    );
  }

  return lines.join("\n");
}
