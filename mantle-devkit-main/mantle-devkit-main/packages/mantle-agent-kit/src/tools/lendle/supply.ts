import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LENDING_POOL, LENDING_POOL_ABI, WMNT_ADDRESS } from "../../constants/lendle";
import { approveToken } from "../../utils/common";
import { createMockLendleResponse } from "../../utils/demo/mockResponses";

/**
 * Supply (deposit) tokens to Lendle Protocol
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to supply
 * @param amount - Amount to supply (in smallest units)
 * @returns Transaction hash
 */
export async function lendleSupply(
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
): Promise<Hex> {
  const lendingPoolAddress = LENDING_POOL[agent.chain];

  if (lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return createMockLendleResponse("supply", amount).txHash;
    }
    throw new Error(
      `Lendle LendingPool not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  const amountBigInt = BigInt(amount);
  const isNative = tokenAddress.toLowerCase() === WMNT_ADDRESS.toLowerCase();

  // Approve token spending if not native
  if (!isNative) {
    await approveToken(agent, tokenAddress, lendingPoolAddress, amount);
  }

  // Encode deposit function call (Aave V2 uses 'deposit' instead of 'supply')
  const data = encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "deposit",
    args: [tokenAddress, amountBigInt, agent.account.address, 0], // referralCode = 0 (uint16)
  });

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to: lendingPoolAddress,
    data,
    value: isNative ? amountBigInt : 0n,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}
