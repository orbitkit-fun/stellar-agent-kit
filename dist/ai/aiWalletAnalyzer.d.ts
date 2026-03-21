import { type BalanceEntry } from "../core/stellarClient.js";
export type RiskLevel = "low" | "medium" | "high";
export interface WalletAnalysisResult {
    summary: string;
    riskLevel: RiskLevel;
    suggestions: string[];
}
export interface WalletAnalyzerDeps {
    fetchBalances?: (address: string) => Promise<BalanceEntry[]>;
    fetchRecentTransactions?: (address: string, limit: number) => Promise<Array<{
        createdAt?: string;
    }>>;
}
export declare function analyzeWallet(publicKey: string, deps?: WalletAnalyzerDeps): Promise<WalletAnalysisResult>;
//# sourceMappingURL=aiWalletAnalyzer.d.ts.map