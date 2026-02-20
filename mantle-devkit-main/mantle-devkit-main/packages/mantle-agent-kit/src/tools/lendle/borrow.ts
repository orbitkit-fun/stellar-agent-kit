import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LENDING_POOL, LENDING_POOL_ABI, INTEREST_RATE_MODE } from "../../constants/lendle";
import { createMockLendleResponse } from "../../utils/demo/mockResponses";

/**
 * Borrow tokens from Lendle Protocol
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to borrow
 * @param amount - Amount to borrow (in smallest units)
 * @param interestRateMode - Interest rate mode (1 = stable, 2 = variable)
 * @param onBehalfOf - Address to receive borrowed tokens (optional, defaults to agent address)
 * @returns Transaction hash
 */
export async function lendleBorrow(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  interestRateMode: 1 | 2 = INTEREST_RATE_MODE.VARIABLE,
  onBehalfOf?: Address,
): Promise<Hex> {
  const lendingPoolAddress = LENDING_POOL[agent.chain];

  if (lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockLendleResponse("borrow", amount).txHash;
    }
    throw new Error(
      `Lendle LendingPool not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  const amountBigInt = BigInt(amount);
  const onBehalfOfAddress = onBehalfOf || agent.account.address;

  // Encode borrow function call
  const data = encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "borrow",
    args: [tokenAddress, amountBigInt, BigInt(interestRateMode), 0, onBehalfOfAddress], // referralCode = 0 (uint16)
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
