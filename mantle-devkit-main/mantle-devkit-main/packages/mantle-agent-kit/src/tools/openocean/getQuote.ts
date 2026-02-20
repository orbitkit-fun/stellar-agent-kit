import type { MNTAgentKit } from "../../agent";
import { getQuoteData, type OpenOceanQuote } from "../../utils/openocean";
import { createMockQuoteResponse } from "../../utils/demo/mockResponses";

/**
 * Get swap quote from OpenOcean
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (human-readable, e.g., "1" for 1 token)
 * @returns Quote data including estimated output amount
 */
export async function getOpenOceanQuote(
  agent: MNTAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<OpenOceanQuote> {
  if (agent.demo) {
    return createMockQuoteResponse("OpenOcean", amount) as unknown as OpenOceanQuote;
  }

  // OpenOcean API expects human-readable decimal amounts directly
  return await getQuoteData(fromToken, toToken, amount, agent.chain);
}
