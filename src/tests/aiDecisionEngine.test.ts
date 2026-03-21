import test from "node:test";
import assert from "node:assert/strict";
import { createAiDecisionEngine } from "../ai/aiDecisionEngine.js";

const sampleAnalysis = {
  summary: "Sample summary",
  riskLevel: "medium" as const,
  suggestions: ["Keep stable allocation"],
};

test("aiDecisionEngine: uses mock LLM response", async () => {
  const engine = createAiDecisionEngine({
    transport: {
      complete: async () =>
        JSON.stringify({
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

  assert.equal(result.action, "swap");
  assert.equal(typeof result.reasoning, "string");
  assert.equal(result.confidence, 0.78);
});

test("aiDecisionEngine: validates output structure via fallback", async () => {
  const engine = createAiDecisionEngine({
    transport: {
      complete: async () => "this-is-not-json",
    },
  });

  const result = await engine.decide({
    walletAnalysis: sampleAnalysis,
    userIntent: "Hold for now",
  });

  assert.ok(["swap", "hold", "send"].includes(result.action));
  assert.equal(typeof result.reasoning, "string");
  assert.equal(result.confidence >= 0 && result.confidence <= 1, true);
});
