"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWallet = analyzeWallet;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const networks_js_1 = require("../config/networks.js");
const stellarClient_js_1 = require("../core/stellarClient.js");
const STABLE_ASSETS = new Set([
    "USDC",
    "USDT",
    "EURC",
    "DAI",
    "BUSD",
    "FDUSD",
    "PYUSD",
]);
const LOW_LIQUIDITY_WARNINGS = new Set(["MEME", "INU", "PEPE", "DOGE"]);
function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
function classifyRisk(distribution, recentTxCount) {
    const nonStableShare = distribution
        .filter((asset) => asset.code !== "XLM" && !STABLE_ASSETS.has(asset.code))
        .reduce((sum, asset) => sum + asset.sharePct, 0);
    const warningAssetShare = distribution
        .filter((asset) => LOW_LIQUIDITY_WARNINGS.has(asset.code))
        .reduce((sum, asset) => sum + asset.sharePct, 0);
    if (warningAssetShare >= 10 || nonStableShare >= 65) {
        return "high";
    }
    if (warningAssetShare > 0 || nonStableShare >= 25 || recentTxCount === 0) {
        return "medium";
    }
    return "low";
}
function buildSummary(distribution, riskLevel, recentTxCount) {
    if (!distribution.length) {
        return "Wallet is empty. No assets were found for the provided address.";
    }
    const top = distribution[0];
    const stableShare = distribution
        .filter((asset) => STABLE_ASSETS.has(asset.code))
        .reduce((sum, asset) => sum + asset.sharePct, 0);
    return [
        `Top asset: ${top.code} (${top.sharePct.toFixed(1)}% of visible balance).`,
        `Stable allocation: ${stableShare.toFixed(1)}%.`,
        `Recent activity: ${recentTxCount} tx in latest scan.`,
        `Estimated portfolio risk: ${riskLevel}.`,
    ].join(" ");
}
function buildSuggestions(distribution, riskLevel, recentTxCount) {
    if (!distribution.length) {
        return [
            "Fund the wallet with XLM to enable transactions and trustline setup.",
            "Add stable assets (for example USDC) for lower volatility exposure.",
        ];
    }
    const suggestions = [];
    const stableShare = distribution
        .filter((asset) => STABLE_ASSETS.has(asset.code))
        .reduce((sum, asset) => sum + asset.sharePct, 0);
    if (stableShare < 20) {
        suggestions.push("Increase stable-asset allocation to reduce volatility risk.");
    }
    if (riskLevel === "high") {
        suggestions.push("Reduce exposure to low-liquidity assets before large swaps.");
    }
    if (recentTxCount === 0) {
        suggestions.push("Verify account health and trustlines before executing new DeFi actions.");
    }
    suggestions.push("Use small test swaps first, then scale size after confirming execution quality.");
    return suggestions;
}
async function defaultFetchBalances(address) {
    const client = new stellarClient_js_1.StellarClient((0, networks_js_1.getNetworkConfig)("mainnet"));
    return client.getBalance(address);
}
async function defaultFetchRecentTransactions(address, limit) {
    const server = new stellar_sdk_1.Horizon.Server((0, networks_js_1.getNetworkConfig)("mainnet").horizonUrl);
    const page = await server
        .transactions()
        .forAccount(address)
        .order("desc")
        .limit(Math.max(1, Math.min(limit, 20)))
        .call();
    return page.records.map((record) => ({ createdAt: record.created_at }));
}
async function analyzeWallet(publicKey, deps = {}) {
    const fetchBalances = deps.fetchBalances ?? defaultFetchBalances;
    const fetchRecentTransactions = deps.fetchRecentTransactions ?? defaultFetchRecentTransactions;
    const balances = await fetchBalances(publicKey);
    const nonZeroBalances = balances.filter((item) => safeNumber(item.balance) > 0);
    const totalBalance = nonZeroBalances.reduce((sum, item) => sum + safeNumber(item.balance), 0);
    const distribution = nonZeroBalances
        .map((item) => {
        const numericBalance = safeNumber(item.balance);
        const sharePct = totalBalance > 0 ? (numericBalance / totalBalance) * 100 : 0;
        return {
            code: item.code.toUpperCase(),
            issuer: item.issuer,
            balance: numericBalance,
            sharePct,
        };
    })
        .sort((a, b) => b.sharePct - a.sharePct);
    let recentTxCount = 0;
    try {
        const recentTx = await fetchRecentTransactions(publicKey, 10);
        recentTxCount = recentTx.length;
    }
    catch {
        recentTxCount = 0;
    }
    const riskLevel = classifyRisk(distribution, recentTxCount);
    return {
        summary: buildSummary(distribution, riskLevel, recentTxCount),
        riskLevel,
        suggestions: buildSuggestions(distribution, riskLevel, recentTxCount),
    };
}
//# sourceMappingURL=aiWalletAnalyzer.js.map