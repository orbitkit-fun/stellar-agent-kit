"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAgentCommand = registerAgentCommand;
const readline_1 = require("readline");
const agentTools_js_1 = require("../tools/agentTools.js");
/** OpenAI-compatible tool definitions (JSON Schema for parameters). */
function toOpenAITools() {
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
                        network: { type: "string", enum: ["mainnet"] },
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
        {
            type: "function",
            function: {
                name: "create_trustline",
                description: "Create trustline to receive tokens like USDC",
                parameters: {
                    type: "object",
                    properties: {
                        address: { type: "string", description: "Stellar address" },
                        assetCode: { type: "string", description: "Asset code (USDC)" },
                        network: { type: "string", enum: ["mainnet"] },
                        privateKey: { type: "string", description: "Complete 56-character secret key starting with S" },
                    },
                    required: ["address", "assetCode", "network", "privateKey"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "get_swap_quote",
                description: "Get swap quote without executing",
                parameters: {
                    type: "object",
                    properties: {
                        fromAsset: { type: "string", description: "From asset (XLM or USDC)" },
                        toAsset: { type: "string", description: "To asset (XLM or USDC)" },
                        amount: { type: "string", description: "Amount to swap" },
                        network: { type: "string", enum: ["mainnet"] },
                    },
                    required: ["fromAsset", "toAsset", "amount", "network"],
                },
            },
        },
    ];
}
/** Read one line from stdin with prompt. */
function readLine(prompt) {
    const rl = (0, readline_1.createInterface)({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
/** Execute tool by name with parsed args; return string for the model. */
async function runOneTool(name, args) {
    // Hide private keys in debug output for security
    const safeArgs = { ...args };
    if (safeArgs.privateKey) {
        safeArgs.privateKey = safeArgs.privateKey.toString().slice(0, 8) + "...";
    }
    console.log(`[DEBUG] Tool called: ${name} with args:`, JSON.stringify(safeArgs, null, 2));
    const tool = agentTools_js_1.tools.find((t) => t.name === name);
    if (!tool)
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    try {
        const result = await tool.execute(args);
        return JSON.stringify(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        return JSON.stringify({ error: message });
    }
}
/**
 * Handle assistant message that may contain tool_calls: execute each, then
 * call OpenAI again with assistant message + tool results until we get a final text response.
 */
async function executeAgentTools(openai, model, messages, assistantMessage) {
    const current = [...messages, assistantMessage];
    if (!assistantMessage.tool_calls?.length) {
        return assistantMessage.content ?? "";
    }
    for (const tc of assistantMessage.tool_calls) {
        let args = {};
        try {
            args = JSON.parse(tc.function.arguments);
        }
        catch {
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
    const msg = choice.message;
    return executeAgentTools(openai, model, current, msg);
}
/** Register the `agent` command on the Commander program. */
function registerAgentCommand(program) {
    program
        .command("agent")
        .description("Chat with Stellar DeFi agent (balance, swap quotes)")
        .option("--api-key <key>", "Groq API key (or set GROQ_API_KEY)")
        .action(async (options) => {
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
        const history = [];
        while (true) {
            const userMessage = await readLine("You: ");
            if (userMessage.toLowerCase() === "exit" || userMessage.toLowerCase() === "quit")
                break;
            if (!userMessage)
                continue;
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
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error("Agent error:", message);
            }
        }
    });
}
//# sourceMappingURL=cliAgent.js.map