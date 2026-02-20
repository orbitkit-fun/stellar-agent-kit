import type { MNTAgentKit } from "../../agent";
import { DEFAULT_POOL_FEE } from "../../constants/uniswap";
import { getUniswapQuoteData, type UniswapQuoteResult } from "../../utils/uniswap";
import { createMockQuoteResponse } from "../../utils/demo/mockResponses";

/**
 * Get swap quote from Uniswap V3
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param fee - Pool fee tier (default: 3000 = 0.3%)
 * @returns Quote with expected output amount
 */
export async function getUniswapQuote(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  fee: number = DEFAULT_POOL_FEE,
): Promise<UniswapQuoteResult> {
  if (agent.demo) {
    return createMockQuoteResponse("Uniswap", amount) as unknown as UniswapQuoteResult;
  }
  return await getUniswapQuoteData(agent, fromToken, toToken, amount, fee);
}
