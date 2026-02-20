/**
 * Example: Using Mantle Agent Kit with Platform Validation
 *
 * This example demonstrates how to initialize the agent kit with APP_ID validation.
 */

import { MNTAgentKit } from "../src/agent";

async function main() {
  // Step 1: Ensure APP_ID is set in environment
  if (!process.env.APP_ID) {
    console.error("Error: APP_ID not found in environment variables");
    console.log("\nSet your APP_ID in .env file:");
    console.log("   APP_ID=your_app_id_here");
    console.log("\nAPP_ID is used to validate your project configuration.");
    process.exit(1);
  }

  try {
    // Step 2: Create agent instance
    const agent = new MNTAgentKit(
      process.env.PRIVATE_KEY as `0x${string}`,
      "mainnet",
    );

    console.log("Agent created successfully");
    console.log("Wallet address:", agent.account.address);

    // Step 3: Initialize with platform validation
    console.log("\nValidating APP_ID with platform...");
    await agent.initialize();

    // Step 4: Access validated project configuration
    console.log("\n✓ Platform validation successful!");
    console.log("Project Configuration:");
    console.log("  Name:", agent.projectConfig?.name);
    console.log("  APP ID:", agent.projectConfig?.appId);
    console.log("  Payout Address:", agent.projectConfig?.payTo);
    console.log("  Network:", agent.projectConfig?.network);
    console.log("  Status:", agent.projectConfig?.status);

    // Step 5: Now you can use all agent methods
    console.log("\n✓ Agent ready for use!");

    // Example: Get MNT balance
    const balance = await agent.client.getBalance({
      address: agent.account.address,
    });
    console.log("\nMNT Balance:", balance.toString(), "wei");
  } catch (error) {
    console.error("\n✗ Initialization failed:");
    if (error instanceof Error) {
      console.error(error.message);

      // Provide helpful hints based on error type
      if (error.message.includes("APP_ID is required")) {
        console.log("\nSet your APP_ID in .env file:");
        console.log("  APP_ID=your_app_id_here");
      } else if (error.message.includes("Project not found")) {
        console.log("\nYour APP_ID is invalid or project doesn't exist.");
        console.log("Please check your APP_ID configuration.");
      } else if (error.message.includes("not active")) {
        console.log("\nYour project is not active.");
        console.log("Please check your project status.");
      }
    }
    process.exit(1);
  }
}

main();
