import { Horizon } from "@stellar/stellar-sdk";
import { getNetworkConfig } from "../config/networks.js";
import { StellarClient, type BalanceEntry } from "../core/stellarClient.js";

export type RiskLevel = "low" | "medium" | "high";

export interface WalletAnalysisResult {
  summary: string;
  riskLevel: RiskLevel;
  suggestions: string[];
}

export interface WalletAnalyzerDeps {
  fetchBalances?: (address: string) => Promise<BalanceEntry[]>;
  fetchRecentTransactions?: (address: string, limit: number) => Promise<Array<{ createdAt?: string }>>;
}

interface AssetDistribution {
  code: string;
  issuer: string | null;
  balance: number;
  sharePct: number;
}

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

function safeNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function classifyRisk(distribution: AssetDistribution[], recentTxCount: number): RiskLevel {
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

function buildSummary(
  distribution: AssetDistribution[],
  riskLevel: RiskLevel,
  recentTxCount: number
): string {
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

function buildSuggestions(
  distribution: AssetDistribution[],
  riskLevel: RiskLevel,
  recentTxCount: number
): string[] {
  if (!distribution.length) {
    return [
      "Fund the wallet with XLM to enable transactions and trustline setup.",
      "Add stable assets (for example USDC) for lower volatility exposure.",
    ];
  }

  const suggestions: string[] = [];
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

async function defaultFetchBalances(address: string): Promise<BalanceEntry[]> {
  const client = new StellarClient(getNetworkConfig("mainnet"));
  return client.getBalance(address);
}

async function defaultFetchRecentTransactions(
  address: string,
  limit: number
): Promise<Array<{ createdAt?: string }>> {
  const server = new Horizon.Server(getNetworkConfig("mainnet").horizonUrl);
  const page = await server
    .transactions()
    .forAccount(address)
    .order("desc")
    .limit(Math.max(1, Math.min(limit, 20)))
    .call();

  return page.records.map((record) => ({ createdAt: record.created_at }));
}

export async function analyzeWallet(
  publicKey: string,
  deps: WalletAnalyzerDeps = {}
): Promise<WalletAnalysisResult> {
  const fetchBalances = deps.fetchBalances ?? defaultFetchBalances;
  const fetchRecentTransactions = deps.fetchRecentTransactions ?? defaultFetchRecentTransactions;

  const balances = await fetchBalances(publicKey);
  const nonZeroBalances = balances.filter((item) => safeNumber(item.balance) > 0);
  const totalBalance = nonZeroBalances.reduce((sum, item) => sum + safeNumber(item.balance), 0);

  const distribution: AssetDistribution[] = nonZeroBalances
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
  } catch {
    recentTxCount = 0;
  }

  const riskLevel = classifyRisk(distribution, recentTxCount);
  return {
    summary: buildSummary(distribution, riskLevel, recentTxCount),
    riskLevel,
    suggestions: buildSuggestions(distribution, riskLevel, recentTxCount),
  };
}
