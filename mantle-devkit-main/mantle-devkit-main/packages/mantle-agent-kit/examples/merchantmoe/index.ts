import { type Address, formatUnits } from "viem";
import { MNTAgentKit } from "../../src";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

async function main() {
  const agent = new MNTAgentKit(process.env.PRIVATE_KEY! as Address, "mainnet");

  console.log("\n=== Native MNT Swap Test ===");
  console.log(`Wallet: ${agent.account.address}`);

  // Get token list to find correct addresses
  const tokens = await agent.getOpenOceanTokens();
  const mnt = tokens.find((t) => t.symbol === "MNT");
  const usdt = tokens.find((t) => t.symbol === "USDT");

  if (!mnt || !usdt) {
    console.log("Could not find MNT or USDT tokens");
    return;
  }

  console.log(`MNT: ${mnt.address}`);
  console.log(`USDT: ${usdt.address}`);

  // Swap 0.02 native MNT to USDT using OpenOcean aggregator
  const amountIn = "0.02";
  console.log(`\nSwapping ${amountIn} native MNT -> USDT...`);

  // Get quote first
  const quote = await agent.getOpenOceanQuote(
    mnt.address as Address,
    usdt.address as Address,
    amountIn,
  );

  const expectedOut = formatUnits(BigInt(quote.outAmount), quote.outToken.decimals);
  console.log(`Expected output: ~${expectedOut} USDT`);

  // Execute swap
  const result = await agent.swapOnOpenOcean(
    mnt.address as Address,
    usdt.address as Address,
    amountIn,
    1, // 1% slippage
  );

  const actualOut = formatUnits(BigInt(result.outAmount), usdt.decimals);
  console.log(`\nSwap complete!`);
  console.log(`Tx Hash: ${result.txHash}`);
  console.log(`Received: ${actualOut} USDT`);
}

main().catch(console.error);
