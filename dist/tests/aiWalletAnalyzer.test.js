"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const aiWalletAnalyzer_js_1 = require("../ai/aiWalletAnalyzer.js");
(0, node_test_1.default)("aiWalletAnalyzer: valid wallet profile", async () => {
    const result = await (0, aiWalletAnalyzer_js_1.analyzeWallet)("GVALIDWALLET", {
        fetchBalances: async () => [
            { code: "XLM", issuer: null, balance: "100" },
            { code: "USDC", issuer: "GISSUER", balance: "50" },
        ],
        fetchRecentTransactions: async () => [{ createdAt: "2026-03-20T00:00:00Z" }],
    });
    strict_1.default.equal(typeof result.summary, "string");
    strict_1.default.match(result.summary, /Top asset:/i);
    strict_1.default.ok(["low", "medium", "high"].includes(result.riskLevel));
    strict_1.default.ok(Array.isArray(result.suggestions));
});
(0, node_test_1.default)("aiWalletAnalyzer: empty wallet", async () => {
    const result = await (0, aiWalletAnalyzer_js_1.analyzeWallet)("GEMPTYWALLET", {
        fetchBalances: async () => [],
        fetchRecentTransactions: async () => [],
    });
    strict_1.default.match(result.summary, /empty/i);
    strict_1.default.equal(result.suggestions.length >= 1, true);
});
(0, node_test_1.default)("aiWalletAnalyzer: edge-case low-liquidity assets", async () => {
    const result = await (0, aiWalletAnalyzer_js_1.analyzeWallet)("GEDGEWALLET", {
        fetchBalances: async () => [
            { code: "PEPE", issuer: "GISSUER", balance: "9000" },
            { code: "XLM", issuer: null, balance: "100" },
        ],
        fetchRecentTransactions: async () => [],
    });
    strict_1.default.equal(result.riskLevel, "high");
    strict_1.default.equal(result.suggestions.some((item) => /low-liquidity|Reduce exposure/i.test(item)), true);
});
//# sourceMappingURL=aiWalletAnalyzer.test.js.map