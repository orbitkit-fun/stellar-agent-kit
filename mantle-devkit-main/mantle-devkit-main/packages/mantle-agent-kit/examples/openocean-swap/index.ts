import { type Address, formatUnits } from "viem";
import { MNTAgentKit } from "../../src";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

async function main() {
  const agent = new MNTAgentKit(process.env.PRIVATE_KEY! as Address, "mainnet");

  // Test 1: Get OpenOcean token list
  console.log("\n=== Test 1: Get OpenOcean Token List ===");
  const tokens = await agent.getOpenOceanTokens();
  console.log(`Found ${tokens.length} tokens on Mantle`);
  console.log("First 5 tokens:");
  tokens.slice(0, 5).forEach((t) => {
    console.log(`  - ${t.symbol}: ${t.address} (${t.decimals} decimals)`);
  });

  // Find USDT and MNT (native) for quote test
  const usdt = tokens.find((t) => t.symbol === "USDT");
  const mnt = tokens.find((t) => t.symbol === "MNT");

  if (!usdt || !mnt) {
    console.log("Could not find USDT or MNT tokens");
    return;
  }

  console.log(`\nMNT (native): ${mnt.address} (${mnt.decimals} decimals)`);
  console.log(`USDT: ${usdt.address} (${usdt.decimals} decimals)`);

  // Test 2: Get quote first
  console.log("\n=== Test 2: Get OpenOcean Swap Quote ===");
  console.log("Getting quote for swapping 0.1 MNT -> USDT...");

  const quote = await agent.getOpenOceanQuote(
    mnt.address as Address,
    usdt.address as Address,
    "0.1",
  );

  const inputHuman = formatUnits(
    BigInt(quote.inAmount),
    quote.inToken.decimals,
  );
  const outputHuman = formatUnits(
    BigInt(quote.outAmount),
    quote.outToken.decimals,
  );

  console.log("Quote received:");
  console.log(`  You pay: ${inputHuman} ${quote.inToken.symbol}`);
  console.log(`  You get: ${outputHuman} ${quote.outToken.symbol}`);

  // Test 3: Execute the swap
  console.log("\n=== Test 3: Execute Swap ===");
  console.log("Swapping 0.1 MNT -> USDT...");

  const result = await agent.swapOnOpenOcean(
    mnt.address as Address,
    usdt.address as Address,
    "0.1",
    1, // 1% slippage
  );

  const outHuman = formatUnits(BigInt(result.outAmount), usdt.decimals);
  console.log(`Swap complete!`);
  console.log(`  Tx Hash: ${result.txHash}`);
  console.log(`  Received: ${outHuman} USDT`);

  console.log("\n=== All tests passed! ===");
}

main().catch(console.error);
