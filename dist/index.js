#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const commander_1 = require("commander");
const networks_js_1 = require("./config/networks.js");
const stellarClient_js_1 = require("./core/stellarClient.js");
const cliAgent_js_1 = require("./demo/cliAgent.js");
const aiCommandHandlers_js_1 = require("./demo/aiCommandHandlers.js");
const program = new commander_1.Command();
program
    .name("stellar-defi-agent-kit")
    .description("Stellar DeFi agent kit – balance and payments")
    .version("1.0.0");
program
    .command("balance")
    .description("Get balance for a Stellar address (G...)")
    .argument("<address>", "Stellar public key (G...)")
    .option("-n, --network <name>", "Network (mainnet only)", "mainnet")
    .action(async (address, opts) => {
    try {
        const config = (0, networks_js_1.getNetworkConfig)();
        const client = new stellarClient_js_1.StellarClient(config);
        const balances = await client.getBalance(address);
        console.log(JSON.stringify(balances, null, 2));
    }
    catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
});
program
    .command("pay")
    .description("Send a payment (XLM or custom asset)")
    .argument("<from-secret>", "Sender secret key (S...)")
    .argument("<to>", "Destination public key (G...)")
    .argument("<amount>", "Amount (e.g. 100 or 10.5)")
    .option("-n, --network <name>", "Network (mainnet only)", "mainnet")
    .option("-a, --asset <code>", "Asset code (default: XLM)")
    .option("-i, --issuer <address>", "Asset issuer (G...) when using --asset")
    .action(async (fromSecret, to, amount, opts) => {
    try {
        if (opts.asset && !opts.issuer) {
            console.error("Error: --issuer is required when using --asset");
            process.exit(1);
        }
        const config = (0, networks_js_1.getNetworkConfig)();
        const client = new stellarClient_js_1.StellarClient(config);
        const result = await client.sendPayment(fromSecret, to, amount, opts.asset, opts.issuer);
        console.log("Transaction submitted:", result.hash);
    }
    catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
});
(0, cliAgent_js_1.registerAgentCommand)(program);
program
    .command("analyze-wallet")
    .description("Analyze wallet allocation, risk and activity")
    .argument("<address>", "Stellar public key (G...)")
    .action(async (address) => {
    try {
        const output = await (0, aiCommandHandlers_js_1.runAnalyzeWallet)(address);
        console.log(output.human);
        console.log("\nJSON:");
        console.log(JSON.stringify(output.json, null, 2));
    }
    catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
});
program
    .command("ai-suggest")
    .description("Analyze wallet + intent and produce AI suggestion (can execute approved swap)")
    .argument("<query>", "Natural language query")
    .option("-a, --address <address>", "Wallet public key (defaults to STELLAR_PUBLIC_KEY)")
    .option("--api-key <key>", "AI API key (or set AI_API_KEY / GROQ_API_KEY / OPENAI_API_KEY)")
    .option("--base-url <url>", "OpenAI-compatible base URL")
    .option("--model <model>", "Model name")
    .option("--secret-key <key>", "Private key used only if user confirms swap execution")
    .action(async (query, opts) => {
    try {
        const address = opts.address ?? process.env.STELLAR_PUBLIC_KEY;
        if (!address) {
            throw new Error("Wallet address is required. Pass --address or set STELLAR_PUBLIC_KEY.");
        }
        const { createInterface } = await import("readline");
        const ask = (prompt) => new Promise((resolve) => {
            const rl = createInterface({ input: process.stdin, output: process.stdout });
            rl.question(prompt, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
        const output = await (0, aiCommandHandlers_js_1.runAiSuggest)({
            query,
            address,
            ask,
            api: {
                apiKey: opts.apiKey,
                baseURL: opts.baseUrl,
                model: opts.model,
            },
            secretKey: opts.secretKey,
            allowExecution: true,
        });
        console.log(output.human);
        console.log("\nJSON:");
        console.log(JSON.stringify(output.json, null, 2));
    }
    catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map