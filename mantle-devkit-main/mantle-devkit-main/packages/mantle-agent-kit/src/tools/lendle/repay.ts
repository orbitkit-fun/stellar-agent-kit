import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LENDING_POOL, LENDING_POOL_ABI, INTEREST_RATE_MODE } from "../../constants/lendle";
import { approveToken } from "../../utils/common";
import { createMockLendleResponse } from "../../utils/demo/mockResponses";

/**
 * Repay borrowed tokens to Lendle Protocol
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to repay
 * @param amount - Amount to repay (in smallest units, use max uint256 for full repayment)
 * @param rateMode - Interest rate mode (1 = stable, 2 = variable)
 * @param onBehalfOf - Address whose debt to repay (optional, defaults to agent address)
 * @returns Transaction hash
 */
export async function lendleRepay(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  rateMode: 1 | 2 = INTEREST_RATE_MODE.VARIABLE,
  onBehalfOf?: Address,
): Promise<Hex> {
  const lendingPoolAddress = LENDING_POOL[agent.chain];

  if (lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockLendleResponse("repay", amount).txHash;
    }
    throw new Error(
      `Lendle LendingPool not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  const amountBigInt = BigInt(amount);
  const onBehalfOfAddress = onBehalfOf || agent.account.address;

  // Approve token spending for repayment
  await approveToken(agent, tokenAddress, lendingPoolAddress, amount);

  // Encode repay function call
  const data = encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "repay",
    args: [tokenAddress, amountBigInt, BigInt(rateMode), onBehalfOfAddress],
  });

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to: lendingPoolAddress,
    data,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}
