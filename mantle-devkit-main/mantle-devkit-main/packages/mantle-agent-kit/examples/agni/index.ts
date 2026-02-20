import { type Address, parseUnits, erc20Abi } from "viem";
import { MNTAgentKit } from "../../src";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const NATIVE_MNT = "0x0000000000000000000000000000000000000000" as Address;
const USDT = "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE" as Address;

async function main() {
  const agent = new MNTAgentKit(process.env.PRIVATE_KEY! as Address, "mainnet");

  console.log("\n=== Agni Swap Example ===");
  console.log(`Wallet: ${agent.account.address}`);

  // Fetch token decimals dynamically
  const decimals = await agent.client.readContract({
    address: USDT,
    abi: erc20Abi,
    functionName: "decimals",
  });

  // Swap 0.02 USDT -> MNT (human readable amount)
  const amount = "0.02";
  const amountIn = parseUnits(amount, decimals).toString();
  console.log(`\nSwapping ${amount} USDT -> MNT on Agni...`);

  const txHash = await agent.agniSwap(
    USDT,
    NATIVE_MNT,
    amountIn,
    1, // 1% slippage
    500, // LOW fee tier
  );

  console.log(`Swap complete!`);
  console.log(`Tx Hash: ${txHash}`);
  console.log(`Explorer: https://explorer.mantle.xyz/tx/${txHash}`);
}

main().catch(console.error);
