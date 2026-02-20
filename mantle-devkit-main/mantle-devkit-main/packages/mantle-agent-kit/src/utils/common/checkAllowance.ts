import { erc20Abi, type Address } from "viem";
import type { MNTAgentKit } from "../../agent";

/**
 * Check token allowance for a spender
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token contract address
 * @param ownerAddress - Token owner's wallet address
 * @param spenderAddress - Spender address (DEX/protocol contract)
 * @returns Allowance amount as bigint
 */
export async function checkAllowance(
  agent: MNTAgentKit,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
): Promise<bigint> {
  try {
    const allowance = await agent.client.readContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [ownerAddress as Address, spenderAddress as Address],
    });
    return allowance;
  } catch (error) {
    console.error("Failed to query allowance:", error);
    throw error;
  }
}
