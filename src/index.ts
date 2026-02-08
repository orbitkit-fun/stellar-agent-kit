#!/usr/bin/env node
import 'dotenv/config';
import { Command } from "commander";
import { getNetworkConfig } from "./config/networks.js";
import { StellarClient } from "./core/stellarClient.js";
import { registerAgentCommand } from "./demo/cliAgent.js";

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

program.parse();
