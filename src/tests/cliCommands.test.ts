import test from "node:test";
import assert from "node:assert/strict";
import { runAnalyzeWallet, runAiSuggest } from "../demo/aiCommandHandlers.js";

const fakeAnalysis = {
  summary: "Top asset: XLM. Stable allocation: 40%. Recent activity: 3 tx.",
  riskLevel: "medium" as const,
  suggestions: ["Increase stable allocation"],
};

test("CLI analyze-wallet handler returns human + json", async () => {
  const output = await runAnalyzeWallet("GTESTADDRESS", async () => fakeAnalysis);

  assert.match(output.human, /Wallet:/);
  assert.equal(output.json.address, "GTESTADDRESS");
  assert.equal(output.json.analysis.riskLevel, "medium");
});

test("CLI ai-suggest handler supports swap flow", async () => {
  const prompts: string[] = [];
  const ask = async (prompt: string): Promise<string> => {
    prompts.push(prompt);
    if (prompt.startsWith("Amount to quote")) return "1";
    if (prompt.startsWith("Approve and execute")) return "yes";
    if (prompt.startsWith("Enter sender private key")) {
      return "SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    }
    return "";
  };

  const output = await runAiSuggest(
    {
      address: "GTESTADDRESS",
      query: "Should I swap XLM to USDC?",
      ask,
      api: {
        transport: {
          complete: async () =>
            JSON.stringify({
              action: "swap",
              reasoning: "Swap requested and risk acceptable",
              confidence: 0.8,
            }),
        },
      },
      analyzeWalletFn: async () => fakeAnalysis,
      allowExecution: true,
    },
    async (name: string) => {
      if (name === "get_swap_quote") {
        return { success: true, quote: { amountIn: "1", amountOut: "0.25" } };
      }
      if (name === "swap_asset") {
        return { success: true, txHash: "abc123" };
      }
      throw new Error("unexpected tool");
    }
  );

  assert.equal(output.json.decision.action, "swap");
  assert.equal(output.json.executed, true);
  assert.equal(output.json.txHash, "abc123");
  assert.equal(prompts.length >= 2, true);
});
