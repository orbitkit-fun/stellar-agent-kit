"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const aiCommandHandlers_js_1 = require("../demo/aiCommandHandlers.js");
const fakeAnalysis = {
    summary: "Top asset: XLM. Stable allocation: 40%. Recent activity: 3 tx.",
    riskLevel: "medium",
    suggestions: ["Increase stable allocation"],
};
(0, node_test_1.default)("CLI analyze-wallet handler returns human + json", async () => {
    const output = await (0, aiCommandHandlers_js_1.runAnalyzeWallet)("GTESTADDRESS", async () => fakeAnalysis);
    strict_1.default.match(output.human, /Wallet:/);
    strict_1.default.equal(output.json.address, "GTESTADDRESS");
    strict_1.default.equal(output.json.analysis.riskLevel, "medium");
});
(0, node_test_1.default)("CLI ai-suggest handler supports swap flow", async () => {
    const prompts = [];
    const ask = async (prompt) => {
        prompts.push(prompt);
        if (prompt.startsWith("Amount to quote"))
            return "1";
        if (prompt.startsWith("Approve and execute"))
            return "yes";
        if (prompt.startsWith("Enter sender private key")) {
            return "SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        }
        return "";
    };
    const output = await (0, aiCommandHandlers_js_1.runAiSuggest)({
        address: "GTESTADDRESS",
        query: "Should I swap XLM to USDC?",
        ask,
        api: {
            transport: {
                complete: async () => JSON.stringify({
                    action: "swap",
                    reasoning: "Swap requested and risk acceptable",
                    confidence: 0.8,
                }),
            },
        },
        analyzeWalletFn: async () => fakeAnalysis,
        allowExecution: true,
    }, async (name) => {
        if (name === "get_swap_quote") {
            return { success: true, quote: { amountIn: "1", amountOut: "0.25" } };
        }
        if (name === "swap_asset") {
            return { success: true, txHash: "abc123" };
        }
        throw new Error("unexpected tool");
    });
    strict_1.default.equal(output.json.decision.action, "swap");
    strict_1.default.equal(output.json.executed, true);
    strict_1.default.equal(output.json.txHash, "abc123");
    strict_1.default.equal(prompts.length >= 2, true);
});
//# sourceMappingURL=cliCommands.test.js.map