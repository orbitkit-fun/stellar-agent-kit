"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSwapIntent = parseSwapIntent;
exports.executeTool = executeTool;
exports.runAnalyzeWallet = runAnalyzeWallet;
exports.runAiSuggest = runAiSuggest;
const aiWalletAnalyzer_js_1 = require("../ai/aiWalletAnalyzer.js");
const aiDecisionEngine_js_1 = require("../ai/aiDecisionEngine.js");
const agentTools_js_1 = require("../tools/agentTools.js");
function toTitleCase(value) {
    return value.trim().toUpperCase();
}
function parseSwapIntent(query) {
    const normalized = query.trim();
    const withAmount = normalized.match(/swap\s+([0-9]+(?:\.[0-9]+)?)\s+([a-zA-Z0-9]+)\s+to\s+([a-zA-Z0-9]+)/i);
    if (withAmount) {
        return {
            amount: withAmount[1],
            fromAsset: toTitleCase(withAmount[2]),
            toAsset: toTitleCase(withAmount[3]),
        };
    }
    const noAmount = normalized.match(/swap\s+([a-zA-Z0-9]+)\s+to\s+([a-zA-Z0-9]+)/i);
    if (!noAmount)
        return null;
    return {
        fromAsset: toTitleCase(noAmount[1]),
        toAsset: toTitleCase(noAmount[2]),
    };
}
async function executeTool(name, args) {
    const tool = agentTools_js_1.tools.find((item) => item.name === name);
    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }
    return tool.execute(args);
}
async function runAnalyzeWallet(address, analyzeWalletFn = aiWalletAnalyzer_js_1.analyzeWallet) {
    const analysis = await analyzeWalletFn(address);
    const human = [
        `Wallet: ${address}`,
        `Risk: ${analysis.riskLevel}`,
        `Summary: ${analysis.summary}`,
        `Suggestions:`,
        ...analysis.suggestions.map((item) => `- ${item}`),
    ].join("\n");
    return {
        human,
        json: { address, analysis },
    };
}
async function runAiSuggest(options, toolExecutor = executeTool) {
    const analyzeWalletFn = options.analyzeWalletFn ?? aiWalletAnalyzer_js_1.analyzeWallet;
    const analysis = await analyzeWalletFn(options.address);
    const decision = await (0, aiDecisionEngine_js_1.createAiDecisionEngine)(options.api).decide({
        walletAnalysis: analysis,
        userIntent: options.query,
    });
    const result = {
        query: options.query,
        address: options.address,
        analysis,
        decision,
    };
    const swapIntent = parseSwapIntent(options.query);
    const executionAllowed = options.allowExecution ?? true;
    if (decision.action === "swap" && decision.confidence >= 0.55 && swapIntent) {
        const amount = swapIntent.amount ?? (await options.ask("Amount to quote (e.g. 1): "));
        const quote = await toolExecutor("get_swap_quote", {
            fromAsset: swapIntent.fromAsset,
            toAsset: swapIntent.toAsset,
            amount,
            network: "mainnet",
        });
        result.quote = quote;
        if (executionAllowed) {
            const confirmation = (await options.ask("Approve and execute this swap? (yes/no): ")).toLowerCase();
            if (confirmation === "yes" || confirmation === "y") {
                const secretKey = options.secretKey ?? (await options.ask("Enter sender private key (S...): "));
                const execution = (await toolExecutor("swap_asset", {
                    fromAsset: swapIntent.fromAsset,
                    toAsset: swapIntent.toAsset,
                    amount,
                    address: options.address,
                    privateKey: secretKey,
                    network: "mainnet",
                }));
                result.executed = !!execution?.success;
                result.txHash = execution?.txHash;
            }
            else {
                result.executed = false;
            }
        }
    }
    const humanLines = [
        `Intent: ${options.query}`,
        `Wallet: ${options.address}`,
        `Suggested action: ${result.decision.action} (${Math.round(result.decision.confidence * 100)}% confidence)`,
        `Reasoning: ${result.decision.reasoning}`,
    ];
    if (result.quote) {
        humanLines.push("Quote fetched successfully.");
    }
    if (result.executed === true) {
        humanLines.push(`Swap executed. Tx hash: ${result.txHash ?? "n/a"}`);
    }
    else if (result.executed === false) {
        humanLines.push("Swap execution skipped by user confirmation.");
    }
    return {
        human: humanLines.join("\n"),
        json: result,
    };
}
//# sourceMappingURL=aiCommandHandlers.js.map