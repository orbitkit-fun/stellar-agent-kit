import { type Address, type Hex, parseUnits } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  NATIVE_TOKEN_ADDRESS,
  OPENOCEAN_EXCHANGE_PROXY,
} from "../../constants/openocean";
import { approveToken } from "../../utils/common";
import { getSwapData, getOpenOceanTokenDecimals } from "../../utils/openocean";
import { createMockOpenOceanSwapResponse } from "../../utils/demo/mockResponses";

/**
 * Execute token swap on OpenOcean
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (human-readable, e.g., "1" for 1 token)
 * @param slippage - Slippage percentage (e.g., "1" for 1%)
 * @returns Transaction hash
 */
export async function swapOnOpenOcean(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string = "1",
): Promise<{ txHash: string; outAmount: string }> {
  if (agent.demo) {
    return createMockOpenOceanSwapResponse(amount);
  }

  if (!agent.demo && agent.chain != "mainnet") {
    throw new Error("Openocean swaps happen only on mainnet");
  }

  const walletAddress = agent.account.address;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Check if token is native (either zero address or dead address)
  const isNativeToken =
    fromToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ||
    fromToken.toLowerCase() === ZERO_ADDRESS.toLowerCase();

  // 1. Approve token if not native (approval needs smallest units)
  if (!isNativeToken) {
    const decimals = await getOpenOceanTokenDecimals(agent.chain, fromToken);
    const amountInSmallestUnit = parseUnits(amount, decimals).toString();
    await approveToken(agent, fromToken, OPENOCEAN_EXCHANGE_PROXY, amountInSmallestUnit);
  }

  // 2. Get swap transaction data (OpenOcean API expects human-readable amounts)
  const swapData = await getSwapData(
    fromToken,
    toToken,
    amount,
    walletAddress,
    slippage,
    agent.chain,
  );

  console.log("OpenOcean swap data received");
  console.log(`Expected output: ${swapData.outAmount}`);

  // 3. Execute swap transaction (let viem estimate gas)
  const txHash = await agent.client.sendTransaction({
    to: swapData.to as Address,
    data: swapData.data as Hex,
    value: BigInt(swapData.value || "0"),
  });

  console.log(`OpenOcean swap tx sent: ${txHash}`);

  // 4. Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(`Swap confirmed: ${receipt.status}`);

  return {
    txHash,
    outAmount: swapData.outAmount,
  };
}
