/**
 * Tests for Portfolio Tracker & Transaction History module
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPortfolioTracker,
  formatPortfolioSummary,
  formatTransactionHistory,
  formatPaymentHistory,
  formatPortfolioChanges,
} from "../portfolio/index.js";
import type {
  PortfolioSummary,
  TransactionRecord,
  PaymentRecord,
  PortfolioSnapshot,
} from "../portfolio/types.js";

// Mock Horizon
const mockLoadAccount = vi.fn();
const mockTransactionsCall = vi.fn();
const mockPaymentsCall = vi.fn();

vi.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: vi.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
      transactions: () => ({
        forAccount: () => ({
          limit: () => ({
            order: () => ({
              cursor: () => ({
                includeFailed: () => ({
                  call: mockTransactionsCall,
                }),
                call: mockTransactionsCall,
              }),
              includeFailed: () => ({
                call: mockTransactionsCall,
              }),
              call: mockTransactionsCall,
            }),
          }),
        }),
      }),
      payments: () => ({
        forAccount: () => ({
          limit: () => ({
            order: () => ({
              cursor: () => ({
                call: mockPaymentsCall,
              }),
              call: mockPaymentsCall,
            }),
          }),
        }),
      }),
    })),
  },
}));

const mockNetworkConfig = {
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
};

describe("Portfolio Tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPortfolio", () => {
    it("should return portfolio summary with native and custom assets", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [
          { asset_type: "native", balance: "100.0000000" },
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
            balance: "50.0000000",
            limit: "922337203685.4775807",
          },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const portfolio = await tracker.getPortfolio("GABC123");

      expect(portfolio.accountId).toBe("GABC123");
      expect(portfolio.nativeBalance).toBe("100.0000000");
      expect(portfolio.assets).toHaveLength(2);
      expect(portfolio.trustlineCount).toBe(1);
      expect(portfolio.lastUpdated).toBeDefined();
    });

    it("should handle account with only native balance", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [{ asset_type: "native", balance: "500.0000000" }],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const portfolio = await tracker.getPortfolio("GABC123");

      expect(portfolio.nativeBalance).toBe("500.0000000");
      expect(portfolio.assets).toHaveLength(1);
      expect(portfolio.trustlineCount).toBe(0);
    });

    it("should handle account with multiple trustlines", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [
          { asset_type: "native", balance: "10.0000000" },
          { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GISSUER1", balance: "100.00", limit: "1000" },
          { asset_type: "credit_alphanum4", asset_code: "BTC", asset_issuer: "GISSUER2", balance: "0.5", limit: "1000" },
          { asset_type: "credit_alphanum4", asset_code: "ETH", asset_issuer: "GISSUER3", balance: "2.0", limit: "1000" },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const portfolio = await tracker.getPortfolio("GABC123");

      expect(portfolio.assets).toHaveLength(4);
      expect(portfolio.trustlineCount).toBe(3);
    });
  });

  describe("getTransactionHistory", () => {
    it("should return formatted transaction records", async () => {
      mockTransactionsCall.mockResolvedValue({
        records: [
          {
            id: "tx1",
            hash: "abc123def456",
            ledger_attr: 12345,
            created_at: "2025-01-01T00:00:00Z",
            source_account: "GABC123",
            fee_charged: "100",
            operation_count: 1,
            memo: "test",
            memo_type: "text",
            successful: true,
          },
          {
            id: "tx2",
            hash: "xyz789ghi012",
            ledger_attr: 12346,
            created_at: "2025-01-02T00:00:00Z",
            source_account: "GABC123",
            fee_charged: "200",
            operation_count: 2,
            successful: false,
          },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const history = await tracker.getTransactionHistory("GABC123");

      expect(history).toHaveLength(2);
      expect(history[0].hash).toBe("abc123def456");
      expect(history[0].successful).toBe(true);
      expect(history[0].operationCount).toBe(1);
      expect(history[1].successful).toBe(false);
    });

    it("should handle empty transaction history", async () => {
      mockTransactionsCall.mockResolvedValue({ records: [] });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const history = await tracker.getTransactionHistory("GABC123");

      expect(history).toHaveLength(0);
    });
  });

  describe("getPaymentHistory", () => {
    it("should return formatted payment records", async () => {
      mockPaymentsCall.mockResolvedValue({
        records: [
          {
            id: "pay1",
            transaction_hash: "txhash1",
            type: "payment",
            asset_type: "native",
            amount: "10.0000000",
            from: "GABC123",
            to: "GDEF456",
            source_account: "GABC123",
            created_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "pay2",
            transaction_hash: "txhash2",
            type: "create_account",
            starting_balance: "1.0000000",
            account: "GNEW789",
            source_account: "GABC123",
            created_at: "2025-01-02T00:00:00Z",
          },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const payments = await tracker.getPaymentHistory("GABC123");

      expect(payments).toHaveLength(2);
      expect(payments[0].type).toBe("payment");
      expect(payments[0].assetCode).toBe("XLM");
      expect(payments[0].amount).toBe("10.0000000");
      expect(payments[1].type).toBe("create_account");
      expect(payments[1].amount).toBe("1.0000000");
    });

    it("should handle custom asset payments", async () => {
      mockPaymentsCall.mockResolvedValue({
        records: [
          {
            id: "pay1",
            transaction_hash: "txhash1",
            type: "payment",
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: "GISSUER1",
            amount: "25.0000000",
            from: "GABC123",
            to: "GDEF456",
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const payments = await tracker.getPaymentHistory("GABC123");

      expect(payments[0].assetCode).toBe("USDC");
      expect(payments[0].assetIssuer).toBe("GISSUER1");
    });

    it("should handle path payments", async () => {
      mockPaymentsCall.mockResolvedValue({
        records: [
          {
            id: "pay1",
            transaction_hash: "txhash1",
            type: "path_payment_strict_receive",
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: "GISSUER1",
            amount: "50.0000000",
            from: "GABC123",
            to: "GDEF456",
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const payments = await tracker.getPaymentHistory("GABC123");

      expect(payments[0].type).toBe("path_payment");
      expect(payments[0].amount).toBe("50.0000000");
    });
  });

  describe("takeSnapshot", () => {
    it("should take a portfolio snapshot", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [
          { asset_type: "native", balance: "100.0000000" },
          { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GISSUER1", balance: "50.00" },
        ],
      });

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const snapshot = await tracker.takeSnapshot("GABC123");

      expect(snapshot.accountId).toBe("GABC123");
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.assets).toHaveLength(2);
      expect(snapshot.assets[0].assetCode).toBe("XLM");
      expect(snapshot.assets[0].balance).toBe("100.0000000");
    });
  });

  describe("compareSnapshots", () => {
    it("should detect balance increases", () => {
      const previous: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now() - 60000,
        assets: [{ assetCode: "XLM", balance: "100.0000000" }],
      };

      const current: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now(),
        assets: [{ assetCode: "XLM", balance: "150.0000000" }],
      };

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const changes = tracker.compareSnapshots(previous, current);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetCode).toBe("XLM");
      expect(parseFloat(changes[0].change)).toBeGreaterThan(0);
      expect(changes[0].changePercent).toBe(50);
    });

    it("should detect balance decreases", () => {
      const previous: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now() - 60000,
        assets: [{ assetCode: "XLM", balance: "200.0000000" }],
      };

      const current: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now(),
        assets: [{ assetCode: "XLM", balance: "100.0000000" }],
      };

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const changes = tracker.compareSnapshots(previous, current);

      expect(changes).toHaveLength(1);
      expect(parseFloat(changes[0].change)).toBeLessThan(0);
      expect(changes[0].changePercent).toBe(-50);
    });

    it("should detect new assets", () => {
      const previous: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now() - 60000,
        assets: [{ assetCode: "XLM", balance: "100.0000000" }],
      };

      const current: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now(),
        assets: [
          { assetCode: "XLM", balance: "100.0000000" },
          { assetCode: "USDC", balance: "50.0000000", issuer: "GISSUER1" },
        ],
      };

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const changes = tracker.compareSnapshots(previous, current);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetCode).toBe("USDC");
      expect(changes[0].changePercent).toBe(100);
    });

    it("should detect removed assets", () => {
      const previous: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now() - 60000,
        assets: [
          { assetCode: "XLM", balance: "100.0000000" },
          { assetCode: "USDC", balance: "50.0000000", issuer: "GISSUER1" },
        ],
      };

      const current: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now(),
        assets: [{ assetCode: "XLM", balance: "100.0000000" }],
      };

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const changes = tracker.compareSnapshots(previous, current);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetCode).toBe("USDC");
      expect(changes[0].changePercent).toBe(-100);
    });

    it("should return empty array when no changes", () => {
      const snapshot: PortfolioSnapshot = {
        accountId: "GABC123",
        timestamp: Date.now(),
        assets: [{ assetCode: "XLM", balance: "100.0000000" }],
      };

      const tracker = createPortfolioTracker(mockNetworkConfig);
      const changes = tracker.compareSnapshots(snapshot, snapshot);

      expect(changes).toHaveLength(0);
    });
  });
});

describe("Portfolio Formatters", () => {
  describe("formatPortfolioSummary", () => {
    it("should format portfolio summary correctly", () => {
      const summary: PortfolioSummary = {
        accountId: "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDE",
        totalValueUsd: 0,
        nativeBalance: "100.0000000",
        nativeValueUsd: 0,
        trustlineCount: 1,
        lastUpdated: Date.now(),
        assets: [
          { assetCode: "XLM", balance: "100.0000000" },
          { assetCode: "USDC", balance: "50.00", issuer: "GISSUER1", limit: "1000" },
        ],
      };

      const output = formatPortfolioSummary(summary);
      expect(output).toContain("Portfolio for");
      expect(output).toContain("Native (XLM): 100.0000000");
      expect(output).toContain("Trustlines: 1");
      expect(output).toContain("USDC: 50.00");
    });
  });

  describe("formatTransactionHistory", () => {
    it("should format transactions correctly", () => {
      const txs: TransactionRecord[] = [
        {
          id: "1",
          hash: "abc123def456ghi789",
          ledger: 12345,
          createdAt: "2025-01-01T00:00:00Z",
          sourceAccount: "GABC123",
          feeCharged: "100",
          operationCount: 1,
          successful: true,
        },
      ];

      const output = formatTransactionHistory(txs);
      expect(output).toContain("Transaction History");
      expect(output).toContain("✓");
      expect(output).toContain("abc123def456");
    });

    it("should handle empty history", () => {
      const output = formatTransactionHistory([]);
      expect(output).toBe("No transactions found.");
    });
  });

  describe("formatPaymentHistory", () => {
    it("should format payments correctly", () => {
      const payments: PaymentRecord[] = [
        {
          id: "1",
          transactionHash: "txhash1",
          type: "payment",
          from: "GABC1234567890",
          to: "GDEF4567890123",
          assetCode: "XLM",
          amount: "10.0000000",
          createdAt: "2025-01-01T00:00:00Z",
        },
      ];

      const output = formatPaymentHistory(payments);
      expect(output).toContain("Payment History");
      expect(output).toContain("PAY 10.0000000 XLM");
    });

    it("should handle empty payments", () => {
      const output = formatPaymentHistory([]);
      expect(output).toBe("No payments found.");
    });
  });

  describe("formatPortfolioChanges", () => {
    it("should format changes correctly", () => {
      const changes = [
        {
          assetCode: "XLM",
          previousBalance: "100.0000000",
          currentBalance: "150.0000000",
          change: "50.0000000",
          changePercent: 50,
        },
      ];

      const output = formatPortfolioChanges(changes);
      expect(output).toContain("Portfolio Changes");
      expect(output).toContain("XLM");
      expect(output).toContain("+50.0000000");
    });

    it("should handle no changes", () => {
      const output = formatPortfolioChanges([]);
      expect(output).toBe("No portfolio changes detected.");
    });
  });
});
