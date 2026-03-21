import test from "node:test";
import assert from "node:assert/strict";
import { analyzeWallet } from "../ai/aiWalletAnalyzer.js";

test("aiWalletAnalyzer: valid wallet profile", async () => {
  const result = await analyzeWallet("GVALIDWALLET", {
    fetchBalances: async () => [
      { code: "XLM", issuer: null, balance: "100" },
      { code: "USDC", issuer: "GISSUER", balance: "50" },
    ],
    fetchRecentTransactions: async () => [{ createdAt: "2026-03-20T00:00:00Z" }],
  });

  assert.equal(typeof result.summary, "string");
  assert.match(result.summary, /Top asset:/i);
  assert.ok(["low", "medium", "high"].includes(result.riskLevel));
  assert.ok(Array.isArray(result.suggestions));
});

test("aiWalletAnalyzer: empty wallet", async () => {
  const result = await analyzeWallet("GEMPTYWALLET", {
    fetchBalances: async () => [],
    fetchRecentTransactions: async () => [],
  });

  assert.match(result.summary, /empty/i);
  assert.equal(result.suggestions.length >= 1, true);
});

test("aiWalletAnalyzer: edge-case low-liquidity assets", async () => {
  const result = await analyzeWallet("GEDGEWALLET", {
    fetchBalances: async () => [
      { code: "PEPE", issuer: "GISSUER", balance: "9000" },
      { code: "XLM", issuer: null, balance: "100" },
    ],
    fetchRecentTransactions: async () => [],
  });

  assert.equal(result.riskLevel, "high");
  assert.equal(result.suggestions.some((item) => /low-liquidity|Reduce exposure/i.test(item)), true);
});
