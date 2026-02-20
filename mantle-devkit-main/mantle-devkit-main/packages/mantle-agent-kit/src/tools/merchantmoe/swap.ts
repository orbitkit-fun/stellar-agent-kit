import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LB_ROUTER, LB_ROUTER_ABI, LB_FACTORY, LB_FACTORY_ABI, WMNT, LB_VERSION } from "../../constants/merchantmoe";
import { approveToken } from "../../utils/common";
import { createMockSwapResponse } from "../../utils/demo/mockResponses";

// Native token placeholder (used to detect native MNT swaps)
const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/**
 * Check if address is native token
 */
function isNativeToken(address: Address): boolean {
  return (
    address.toLowerCase() === NATIVE_ADDRESS.toLowerCase() ||
    address === "0x0000000000000000000000000000000000000000"
  );
}

/**
 * Get available LB pairs for a token pair
 */
async function getAvailablePairs(
  agent: MNTAgentKit,
  tokenA: Address,
  tokenB: Address,
): Promise<{ binStep: number; lbPair: Address; ignoredForRouting: boolean }[]> {
  const factoryAddress = LB_FACTORY[agent.chain];

  const pairs = await agent.client.readContract({
    address: factoryAddress,
    abi: LB_FACTORY_ABI,
    functionName: "getAllLBPairs",
    args: [tokenA, tokenB],
  });

  return pairs.map((p) => ({
    binStep: p.binStep,
    lbPair: p.LBPair,
    ignoredForRouting: p.ignoredForRouting,
  }));
}

/**
 * Swap tokens on Merchant Moe DEX (LB Router)
 * Supports native MNT -> Token and Token -> Token swaps
 * @param agent - MNTAgentKit instance
 * @param tokenIn - Input token address (use 0xEeee...EEeE for native MNT)
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in smallest units)
 * @param slippagePercent - Slippage tolerance (default: 0.5%)
 * @param binStep - Bin step for the pair (optional, will auto-detect)
 * @returns Transaction hash
 */
export async function merchantMoeSwap(
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
  binStep?: number,
): Promise<Hex> {
  const routerAddress = LB_ROUTER[agent.chain];

  if (routerAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockSwapResponse("MerchantMoe", amountIn).txHash;
    }
    throw new Error(`Merchant Moe LB Router not available on ${agent.chain}`);
  }

  const amountInBigInt = BigInt(amountIn);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min

  const isNativeIn = isNativeToken(tokenIn);
  const wmntAddress = WMNT[agent.chain];

  // Determine actual token addresses for pool lookup
  const actualTokenIn = isNativeIn ? wmntAddress : tokenIn;

  // Find available pairs if binStep not provided
  let useBinStep = binStep;
  if (!useBinStep) {
    console.log("Looking for available liquidity pools...");
    const pairs = await getAvailablePairs(agent, actualTokenIn, tokenOut);
    console.log(`All pairs found:`, pairs);
    const validPairs = pairs.filter((p) => !p.ignoredForRouting);

    if (validPairs.length === 0) {
      throw new Error(`No liquidity pool found for ${actualTokenIn}/${tokenOut}. Try a different token pair.`);
    }

    // Use the first valid pair's bin step
    const bestPair = validPairs[0]!;
    useBinStep = bestPair.binStep;
    console.log(`Using pool: ${bestPair.lbPair} with bin step: ${useBinStep}`);
  }

  // Calculate minimum out with slippage (0 = accept any for now)
  const amountOutMin = 0n;

  // Build path struct - use V2_1 (version 2) for Merchant Moe pools
  const path = {
    pairBinSteps: [BigInt(useBinStep)],
    versions: [LB_VERSION.V2_1],
    tokenPath: isNativeIn
      ? [wmntAddress, tokenOut]
      : [tokenIn, tokenOut],
  };

  if (isNativeIn) {
    // Native MNT -> Token swap
    const data = encodeFunctionData({
      abi: LB_ROUTER_ABI,
      functionName: "swapExactNATIVEForTokens",
      args: [amountOutMin, path, agent.account.address, deadline],
    });

    const hash = await agent.client.sendTransaction({
      to: routerAddress,
      data,
      value: amountInBigInt,
    });

    await agent.client.waitForTransactionReceipt({ hash });
    return hash;
  } else {
    // Token -> Token swap
    await approveToken(agent, tokenIn, routerAddress, amountIn);

    const data = encodeFunctionData({
      abi: LB_ROUTER_ABI,
      functionName: "swapExactTokensForTokens",
      args: [amountInBigInt, amountOutMin, path, agent.account.address, deadline],
    });

    const hash = await agent.client.sendTransaction({
      to: routerAddress,
      data,
    });

    await agent.client.waitForTransactionReceipt({ hash });
    return hash;
  }
}
