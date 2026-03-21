#!/usr/bin/env node
import 'dotenv/config';
import { Command } from "commander";
import { getNetworkConfig } from "./config/networks.js";
import { StellarClient } from "./core/stellarClient.js";
import { registerAgentCommand } from "./demo/cliAgent.js";
import { runAnalyzeWallet, runAiSuggest } from "./demo/aiCommandHandlers.js";

const program = new Command();

program
  .name("stellar-defi-agent-kit")
  .description("Stellar DeFi agent kit – balance and payments")
  .version("1.0.0");

program
  .command("balance")
  .description("Get balance for a Stellar address (G...)")
  .argument("<address>", "Stellar public key (G...)")
  .option("-n, --network <name>", "Network (mainnet only)", "mainnet")
  .action(async (address: string, opts: { network: string }) => {
    try {
      const config = getNetworkConfig();
      const client = new StellarClient(config);
      const balances = await client.getBalance(address);
      console.log(JSON.stringify(balances, null, 2));
    } catch (err) {
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
  .action(
    async (
      fromSecret: string,
      to: string,
      amount: string,
      opts: { network: string; asset?: string; issuer?: string }
    ) => {
      try {
        if (opts.asset && !opts.issuer) {
          console.error("Error: --issuer is required when using --asset");
          process.exit(1);
        }
        const config = getNetworkConfig();
        const client = new StellarClient(config);
        const result = await client.sendPayment(
          fromSecret,
          to,
          amount,
          opts.asset,
          opts.issuer
        );
        console.log("Transaction submitted:", result.hash);
      } catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
      }
    }
  );

registerAgentCommand(program);

program
  .command("analyze-wallet")
  .description("Analyze wallet allocation, risk and activity")
  .argument("<address>", "Stellar public key (G...)")
  .action(async (address: string) => {
    try {
      const output = await runAnalyzeWallet(address);
      console.log(output.human);
      console.log("\nJSON:");
      console.log(JSON.stringify(output.json, null, 2));
    } catch (err) {
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
  .action(
    async (
      query: string,
      opts: {
        address?: string;
        apiKey?: string;
        baseUrl?: string;
        model?: string;
        secretKey?: string;
      }
    ) => {
      try {
        const address = opts.address ?? process.env.STELLAR_PUBLIC_KEY;
        if (!address) {
          throw new Error("Wallet address is required. Pass --address or set STELLAR_PUBLIC_KEY.");
        }

        const { createInterface } = await import("readline");
        const ask = (prompt: string) =>
          new Promise<string>((resolve) => {
            const rl = createInterface({ input: process.stdin, output: process.stdout });
            rl.question(prompt, (answer) => {
              rl.close();
              resolve(answer.trim());
            });
          });

        const output = await runAiSuggest({
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
      } catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        process.exit(1);
      }
    }
  );

program.parse();
