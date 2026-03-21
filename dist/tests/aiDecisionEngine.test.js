"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const aiDecisionEngine_js_1 = require("../ai/aiDecisionEngine.js");
const sampleAnalysis = {
    summary: "Sample summary",
    riskLevel: "medium",
    suggestions: ["Keep stable allocation"],
};
(0, node_test_1.default)("aiDecisionEngine: uses mock LLM response", async () => {
    const engine = (0, aiDecisionEngine_js_1.createAiDecisionEngine)({
        transport: {
            complete: async () => JSON.stringify({
                action: "swap",
                reasoning: "User asked to swap and risk is acceptable.",
                confidence: 0.78,
            }),
        },
    });
    const result = await engine.decide({
        walletAnalysis: sampleAnalysis,
        userIntent: "Should I swap XLM to USDC?",
    });
    strict_1.default.equal(result.action, "swap");
    strict_1.default.equal(typeof result.reasoning, "string");
    strict_1.default.equal(result.confidence, 0.78);
});
(0, node_test_1.default)("aiDecisionEngine: validates output structure via fallback", async () => {
    const engine = (0, aiDecisionEngine_js_1.createAiDecisionEngine)({
        transport: {
            complete: async () => "this-is-not-json",
        },
    });
    const result = await engine.decide({
        walletAnalysis: sampleAnalysis,
        userIntent: "Hold for now",
    });
    strict_1.default.ok(["swap", "hold", "send"].includes(result.action));
    strict_1.default.equal(typeof result.reasoning, "string");
    strict_1.default.equal(result.confidence >= 0 && result.confidence <= 1, true);
});
//# sourceMappingURL=aiDecisionEngine.test.js.map