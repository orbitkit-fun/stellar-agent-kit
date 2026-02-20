/**
 * Complete Workflow Example
 *
 * Demonstrates full agent initialization with x402 validation
 * and performing various DeFi operations
 */

import { MNTAgentKit } from "../src/agent";

async function main() {
  console.log("=== Mantle Agent Kit - Complete Workflow Example ===\n");

  // 1. Initialize Agent with Platform Validation
  console.log("Step 1: Initializing agent...");
  const agent = new MNTAgentKit(
    process.env.PRIVATE_KEY as `0x${string}`,
    "mainnet",
  );

  console.log("Step 2: Validating APP_ID...");
  try {
    await agent.initialize();
    console.log("✓ Platform validation successful!");
    console.log(`  Project: ${agent.projectConfig?.name}`);
    console.log(`  Network: ${agent.projectConfig?.network}\n`);
  } catch (error) {
    console.error("✗ Validation failed:", error);
    process.exit(1);
  }

  // 2. Check Balance
  console.log("Step 3: Checking wallet balance...");
  const balance = await agent.client.getBalance({
    address: agent.account.address,
  });
  console.log(`  Balance: ${balance} wei\n`);

  // 3. Example: Get mETH token address
  console.log("Step 4: Getting mETH token address...");
  const methAddress = agent.getMethTokenAddress();
  console.log(`  mETH: ${methAddress}\n`);

  // 4. Example: Get swap quote from Agni Finance
  console.log("Step 5: Example operations available:");
  console.log("  ✓ DEX Swaps (Agni, Merchant Moe, Uniswap V3)");
  console.log("  ✓ DEX Aggregators (OKX, OpenOcean)");
  console.log("  ✓ Lending (Lendle - supply, borrow, repay, withdraw)");
  console.log("  ✓ Liquid Staking (mETH)");
  console.log("  ✓ Cross-chain (Squid Router)");

  console.log("\n=== Agent Ready for DeFi Operations ===");
  console.log(`Wallet: ${agent.account.address}`);
  console.log(`Project: ${agent.projectConfig?.name}`);
  console.log(`Payout Address: ${agent.projectConfig?.payTo}`);
}

main().catch(console.error);
