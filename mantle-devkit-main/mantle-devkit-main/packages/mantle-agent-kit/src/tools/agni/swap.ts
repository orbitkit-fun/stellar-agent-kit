import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { SWAP_ROUTER, SWAP_ROUTER_ABI, FEE_TIERS, WMNT } from "../../constants/agni";
import { approveToken } from "../../utils/common";
import { createMockSwapResponse } from "../../utils/demo/mockResponses";

const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

function isNativeToken(address: Address): boolean {
  return (
    address.toLowerCase() === NATIVE_ADDRESS.toLowerCase() ||
    address === "0x0000000000000000000000000000000000000000"
  );
}

/**
 * Swap tokens on Agni Finance DEX
 * @param agent - MNTAgentKit instance
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in smallest units)
 * @param slippagePercent - Slippage tolerance (default: 0.5%)
 * @param feeTier - Pool fee tier (default: MEDIUM = 0.3%)
 * @returns Transaction hash
 */
export async function agniSwap(
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
  feeTier: number = FEE_TIERS.MEDIUM,
): Promise<Hex> {
  const swapRouterAddress = SWAP_ROUTER[agent.chain];

  if (swapRouterAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockSwapResponse("Agni", amountIn).txHash;
    }
    throw new Error(`Agni SwapRouter not available on ${agent.chain}`);
  }

  const amountInBigInt = BigInt(amountIn);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes

  // Set amountOutMinimum to 0 (no quote function available)
  // For production, implement a quoter to get expected output
  const amountOutMinimum = 0n;

  const isNativeIn = isNativeToken(tokenIn);
  const isNativeOut = isNativeToken(tokenOut);
  const wmntAddress = WMNT[agent.chain];
  const actualTokenIn = isNativeIn ? wmntAddress : tokenIn;
  const actualTokenOut = isNativeOut ? wmntAddress : tokenOut;

  // Approve token (skip for native)
  if (!isNativeIn) {
    await approveToken(agent, tokenIn, swapRouterAddress, amountIn);
  }

  // Encode swap
  const data = encodeFunctionData({
    abi: SWAP_ROUTER_ABI,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: actualTokenIn,
        tokenOut: actualTokenOut,
        fee: feeTier,
        recipient: agent.account.address,
        deadline,
        amountIn: amountInBigInt,
        amountOutMinimum,
        sqrtPriceLimitX96: 0n,
      },
    ],
  });

  const hash = await agent.client.sendTransaction({
    to: swapRouterAddress,
    data,
    value: isNativeIn ? amountInBigInt : 0n,
  });

  await agent.client.waitForTransactionReceipt({ hash });
  return hash;
}
