import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LENDING_POOL, LENDING_POOL_ABI } from "../../constants/lendle";
import { createMockLendleResponse } from "../../utils/demo/mockResponses";

/**
 * Withdraw tokens from Lendle Protocol
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to withdraw
 * @param amount - Amount to withdraw (in smallest units, use max uint256 for max)
 * @param to - Address to receive withdrawn tokens (optional, defaults to agent address)
 * @returns Transaction hash
 */
export async function lendleWithdraw(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  to?: Address,
): Promise<Hex> {
  const lendingPoolAddress = LENDING_POOL[agent.chain];

  if (lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockLendleResponse("withdraw", amount).txHash;
    }
    throw new Error(
      `Lendle LendingPool not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  const amountBigInt = BigInt(amount);
  const toAddress = to || agent.account.address;

  // Encode withdraw function call
  const data = encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "withdraw",
    args: [tokenAddress, amountBigInt, toAddress],
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
