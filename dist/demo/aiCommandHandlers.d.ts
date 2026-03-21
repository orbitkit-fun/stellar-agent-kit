import { type WalletAnalysisResult } from "../ai/aiWalletAnalyzer.js";
import { type AiDecisionResult, type AiDecisionEngineOptions } from "../ai/aiDecisionEngine.js";
export interface CommandOutput<T> {
    human: string;
    json: T;
}
export interface AnalyzeWalletOutput {
    address: string;
    analysis: WalletAnalysisResult;
}
export interface AiSuggestOutput {
    query: string;
    address: string;
    analysis: WalletAnalysisResult;
    decision: AiDecisionResult;
    quote?: unknown;
    executed?: boolean;
    txHash?: string;
    error?: string;
}
export interface SwapIntent {
    fromAsset: string;
    toAsset: string;
    amount?: string;
}
export interface RunAiSuggestOptions {
    address: string;
    query: string;
    ask: (prompt: string) => Promise<string>;
    api: AiDecisionEngineOptions;
    allowExecution?: boolean;
    secretKey?: string;
    analyzeWalletFn?: (address: string) => Promise<WalletAnalysisResult>;
}
type ToolExecutor = (name: string, args: Record<string, unknown>) => Promise<unknown>;
export declare function parseSwapIntent(query: string): SwapIntent | null;
export declare function executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
export declare function runAnalyzeWallet(address: string, analyzeWalletFn?: (address: string) => Promise<WalletAnalysisResult>): Promise<CommandOutput<AnalyzeWalletOutput>>;
export declare function runAiSuggest(options: RunAiSuggestOptions, toolExecutor?: ToolExecutor): Promise<CommandOutput<AiSuggestOutput>>;
export {};
//# sourceMappingURL=aiCommandHandlers.d.ts.map