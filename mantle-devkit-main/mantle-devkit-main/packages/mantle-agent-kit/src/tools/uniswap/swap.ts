import type { Address, Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { DEFAULT_POOL_FEE, SWAP_ROUTER_ADDRESS, NATIVE_TOKEN_ADDRESS } from "../../constants/uniswap";
import { approveToken } from "../../utils/common";
import { getUniswapQuoteData, buildSwapCalldata } from "../../utils/uniswap";
import { createMockUniswapSwapResponse } from "../../utils/demo/mockResponses";

/**
 * Execute token swap on Uniswap V3
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param slippage - Slippage percentage (e.g., "0.5" for 0.5%)
 * @param fee - Pool fee tier (default: 3000 = 0.3%)
 * @returns Transaction hash and output amount
 */
export async function swapOnUniswap(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string = "0.5",
  fee: number = DEFAULT_POOL_FEE,
): Promise<{ txHash: string; amountOut: string }> {
  if (agent.demo) {
    return createMockUniswapSwapResponse(amount);
  }

  const walletAddress = agent.account.address;
  const isNativeIn = fromToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();

  // 1. Get quote for expected output
  const quote = await getUniswapQuoteData(agent, fromToken, toToken, amount, fee);
  console.log(`Uniswap quote: ${quote.amountOut.toString()}`);

  // 2. Calculate minimum output with slippage
  const slippageBps = Math.floor(parseFloat(slippage) * 100); // Convert to basis points
  const amountOutMinimum = (quote.amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

  // 3. Approve token if not native
  if (!isNativeIn) {
    await approveToken(agent, fromToken, SWAP_ROUTER_ADDRESS, amount);
  }

  // 4. Build swap calldata
  const calldata = buildSwapCalldata(
    {
      tokenIn: fromToken,
      tokenOut: toToken,
      amountIn: amount,
      amountOutMinimum: amountOutMinimum.toString(),
      recipient: walletAddress,
    },
    fee,
  );

  // 5. Estimate gas
  const gasEstimate = await agent.client.estimateGas({
    account: agent.account,
    to: SWAP_ROUTER_ADDRESS as Address,
    data: calldata as Hex,
    value: isNativeIn ? BigInt(amount) : BigInt(0),
  });

  // 6. Execute swap transaction
  const txHash = await agent.client.sendTransaction({
    to: SWAP_ROUTER_ADDRESS as Address,
    data: calldata as Hex,
    value: isNativeIn ? BigInt(amount) : BigInt(0),
    gas: gasEstimate,
  });

  console.log(`Uniswap swap tx sent: ${txHash}`);

  // 7. Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(`Swap confirmed: ${receipt.status}`);

  return {
    txHash,
    amountOut: quote.amountOut.toString(),
  };
}
