import OpenAI from "openai";
import { z } from "zod";
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

const DecisionSchema = z.object({
  action: z.string().min(1),
  reasoning: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

function resolveApiKey(options?: AiDecisionEngineOptions): string | undefined {
  if (options?.apiKey) return options.apiKey;
  if (options?.apiKeyEnvVar && process.env[options.apiKeyEnvVar]) {
    return process.env[options.apiKeyEnvVar];
  }
  return process.env.AI_API_KEY ?? process.env.GROQ_API_KEY ?? process.env.OPENAI_API_KEY;
}

function defaultModel(baseURL?: string): string {
  if (baseURL?.includes("groq")) return "llama-3.1-8b-instant";
  if (process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) return "llama-3.1-8b-instant";
  return "gpt-4o-mini";
}

function buildPrompt(input: AiDecisionEngineInput): string {
  return [
    "You are a Stellar wallet decision engine.",
    "Decide one next action based on wallet analysis and user intent.",
    "Allowed action values: swap, hold, send.",
    "Return strict JSON only:",
    '{"action":"swap|hold|send","reasoning":"...","confidence":0.0}',
    `Wallet analysis: ${JSON.stringify(input.walletAnalysis)}`,
    `User intent: ${input.userIntent}`,
  ].join("\n");
}

function parseDecision(raw: string): AiDecisionResult {
  const trimmed = raw.trim();
  const blockMatch = trimmed.match(/\{[\s\S]*\}/);
  const payload = blockMatch ? blockMatch[0] : trimmed;
  const parsed = JSON.parse(payload) as unknown;
  return DecisionSchema.parse(parsed);
}

function fallbackDecision(input: AiDecisionEngineInput): AiDecisionResult {
  const intent = input.userIntent.toLowerCase();
  if (intent.includes("swap")) {
    if (input.walletAnalysis.riskLevel === "high") {
      return {
        action: "hold",
        reasoning: "Portfolio risk is high. Rebalance before making additional swaps.",
        confidence: 0.62,
      };
    }
    return {
      action: "swap",
      reasoning: "Intent explicitly requests a swap and portfolio risk is not high.",
      confidence: 0.68,
    };
  }
  if (intent.includes("send")) {
    return {
      action: "send",
      reasoning: "Intent points to a transfer flow.",
      confidence: 0.64,
    };
  }
  return {
    action: "hold",
    reasoning: "Defaulting to hold due to ambiguous intent.",
    confidence: 0.51,
  };
}

function createDefaultTransport(options?: AiDecisionEngineOptions): LlmTransport | undefined {
  const apiKey = resolveApiKey(options);
  if (!apiKey) return undefined;

  const baseURL =
    options?.baseURL ??
    process.env.AI_BASE_URL ??
    (process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined);

  const model = options?.model ?? defaultModel(baseURL);
  const client = new OpenAI({ apiKey, baseURL });

  return {
    complete: async (prompt: string) => {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0]?.message?.content ?? "";
    },
  };
}

export function createAiDecisionEngine(options?: AiDecisionEngineOptions): {
  decide: (input: AiDecisionEngineInput) => Promise<AiDecisionResult>;
} {
  const transport = options?.transport ?? createDefaultTransport(options);

  return {
    decide: async (input: AiDecisionEngineInput): Promise<AiDecisionResult> => {
      if (!transport) {
        return fallbackDecision(input);
      }

      try {
        const raw = await transport.complete(buildPrompt(input));
        return parseDecision(raw);
      } catch {
        return fallbackDecision(input);
      }
    },
  };
}
