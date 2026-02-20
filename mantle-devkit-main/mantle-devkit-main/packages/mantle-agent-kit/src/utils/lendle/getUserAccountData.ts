import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { LENDING_POOL, LENDING_POOL_ABI } from "../../constants/lendle";

export interface UserAccountData {
  totalCollateralETH: bigint;
  totalDebtETH: bigint;
  availableBorrowsETH: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

/**
 * Get user account data from Lendle LendingPool
 * @param agent - MNTAgentKit instance
 * @param userAddress - User wallet address (optional, defaults to agent account)
 * @returns User account data including collateral, debt, and health factor
 */
export async function getUserAccountData(
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<UserAccountData> {
  const lendingPoolAddress = LENDING_POOL[agent.chain];
  const address = userAddress || agent.account.address;

  if (lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Lendle LendingPool not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  const result = (await agent.client.readContract({
    address: lendingPoolAddress,
    abi: LENDING_POOL_ABI,
    functionName: "getUserAccountData",
    args: [address],
  })) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];

  return {
    totalCollateralETH: result[0],
    totalDebtETH: result[1],
    availableBorrowsETH: result[2],
    currentLiquidationThreshold: result[3],
    ltv: result[4],
    healthFactor: result[5],
  };
}
