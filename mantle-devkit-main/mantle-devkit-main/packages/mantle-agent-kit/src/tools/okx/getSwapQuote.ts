import { parseUnits } from "viem";
import type { MNTAgentKit } from "../../agent";
import { getSwapTransaction, getTokenDecimals } from "../../utils/okx";
import { createMockQuoteResponse } from "../../utils/demo/mockResponses";

export const getSwapQuote = async (
  agent: MNTAgentKit,
  from: string,
  to: string,
  amount: string,
  slippagePercentage: string,
) => {
  if (agent.demo) {
    return createMockQuoteResponse("OKX", amount);
  }

  const chainIndex = agent.chain === "mainnet" ? "5000" : "5003";
  const userWalletAddress = agent.account.address;
  const decimals = await getTokenDecimals(chainIndex, from);
  const amountInWei = parseUnits(amount, decimals).toString();

  return getSwapTransaction(
    from,
    to,
    amountInWei,
    userWalletAddress,
    chainIndex,
    slippagePercentage,
  );
};
