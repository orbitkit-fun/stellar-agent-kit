import { createInterface } from "readline";
import type { Command } from "commander";
import type OpenAI from "openai";
import { tools } from "../tools/agentTools.js";

/** Local types for OpenAI API. */
type ChatCompletionTool = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};
type AssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
};
type ChatMessage = AssistantMessage | { role: "tool"; tool_call_id: string; content: string } | { role: "user"; content: string };

/** OpenAI-compatible tool definitions (JSON Schema for parameters). */
function toOpenAITools(): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "check_balance",
        description: "Get token balances",
        parameters: {
          type: "object",
          properties: {
            address: { type: "string", description: "Stellar address" },
            network: { type: "string", enum: ["testnet", "mainnet"] },
          },
          required: ["address"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "swap_asset",
        description: "Swap tokens. Include privateKey to execute, omit for quote only.",
        parameters: {
          type: "object",
          properties: {
            fromAsset: { type: "string", description: "Asset to swap from (XLM or USDC)" },
            toAsset: { type: "string", description: "Asset to swap to (XLM or USDC)" },
            amount: { type: "string", description: "Amount to swap (just the number, e.g. '0.2')" },
            address: { type: "string", description: "Stellar address" },
            network: { type: "string", enum: ["testnet", "mainnet"], description: "Network" },
            privateKey: { type: "string", description: "Complete 56-character secret key starting with S" },
          },
          required: ["fromAsset", "toAsset", "amount", "address", "network"],
        },
      },
    },
  ];
}

/** Read one line from stdin with prompt. */
function readLine(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Execute tool by name with parsed args; return string for the model. */
async function runOneTool(name: string, args: Record<string, unknown>): Promise<string> {
  console.log(`[DEBUG] Tool called: ${name} with args:`, JSON.stringify(args, null, 2));
  const tool = tools.find((t) => t.name === name);
  if (!tool) return JSON.stringify({ error: `Unknown tool: ${name}` });
  try {
    const result = await tool.execute(args as never);
    return JSON.stringify(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return JSON.stringify({ error: message });
  }
}

/**
 * Handle assistant message that may contain tool_calls: execute each, then
 * call OpenAI again with assistant message + tool results until we get a final text response.
 */
async function executeAgentTools(
  openai: OpenAI,
  model: string,
  messages: ChatMessage[],
  assistantMessage: AssistantMessage
): Promise<string> {
  const current: ChatMessage[] = [...messages, assistantMessage];

  if (!assistantMessage.tool_calls?.length) {
    return assistantMessage.content ?? "";
  }

  for (const tc of assistantMessage.tool_calls) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
    } catch {
      args = {};
    }
    const result = await runOneTool(tc.function.name, args);
    current.push({
      role: "tool",
      tool_call_id: tc.id,
      content: result,
    });
  }

  const next = await openai.chat.completions.create({
    model,
    messages: current,
    tools: toOpenAITools(),
    tool_choice: "auto",
  });

  const choice = next.choices[0];
  if (!choice?.message) {
    return "No response from model.";
  }

  const msg = choice.message as AssistantMessage;
  return executeAgentTools(openai, model, current, msg);
}

/** Register the `agent` command on the Commander program. */
export function registerAgentCommand(program: Command): void {
  program
    .command("agent")
    .description("Chat with Stellar DeFi agent (balance, swap quotes)")
    .option("--api-key <key>", "Groq API key (or set GROQ_API_KEY)")
    .action(async (options: { apiKey?: string }) => {
      const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error("Error: Set GROQ_API_KEY or pass --api-key <key>");
        process.exit(1);
      }

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const model = "llama-3.1-8b-instant";

      console.log("Stellar DeFi Agent. Commands: check balance, get swap quotes. Type 'exit' to quit.\n");

      const history: ChatMessage[] = [];

      while (true) {
        const userMessage = await readLine("You: ");
        if (userMessage.toLowerCase() === "exit" || userMessage.toLowerCase() === "quit") break;
        if (!userMessage) continue;

        history.push({ role: "user", content: userMessage });

        try {
          const response = await openai.chat.completions.create({
            model,
            messages: history,
            tools: toOpenAITools(),
            tool_choice: "auto",
          });

          const choice = response.choices[0];
          if (!choice?.message) {
            console.log("Agent: (no response)");
            continue;
          }

          const assistantMessage = choice.message;

          const final = await executeAgentTools(openai, model, history, assistantMessage);
          console.log("Agent:", final);

          history.push({ role: "assistant", content: final });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("Agent error:", message);
        }
      }
    });
}
