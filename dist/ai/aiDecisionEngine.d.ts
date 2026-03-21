import type { WalletAnalysisResult } from "./aiWalletAnalyzer.js";
export interface AiDecisionResult {
    action: string;
    reasoning: string;
    confidence: number;
}
export interface AiDecisionEngineInput {
    walletAnalysis: WalletAnalysisResult;
    userIntent: string;
}
export interface LlmTransport {
    complete: (prompt: string) => Promise<string>;
}
export interface AiDecisionEngineOptions {
    apiKey?: string;
    apiKeyEnvVar?: string;
    baseURL?: string;
    model?: string;
    transport?: LlmTransport;
}
export declare function createAiDecisionEngine(options?: AiDecisionEngineOptions): {
    decide: (input: AiDecisionEngineInput) => Promise<AiDecisionResult>;
};
//# sourceMappingURL=aiDecisionEngine.d.ts.map