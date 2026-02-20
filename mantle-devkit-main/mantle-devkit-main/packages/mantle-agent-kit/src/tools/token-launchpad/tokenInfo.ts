import { type Address, erc20Abi } from "viem";
import type { MNTAgentKit } from "../../agent";
import { type TokenInfo } from "../../constants/token-launchpad";

/**
 * Get token information
 */
export async function getTokenInfo(
  agent: MNTAgentKit,
  tokenAddress: Address,
  holder?: Address,
): Promise<TokenInfo> {
  if (agent.demo) {
    return {
      address: tokenAddress,
      name: "Demo Token",
      symbol: "DEMO",
      decimals: 18,
      totalSupply: "1000000000000000000000000",
      balance: holder ? "1000000000000000000000" : undefined,
    };
  }

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    agent.client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" }),
    agent.client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }),
    agent.client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
    agent.client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "totalSupply" }),
  ]) as [string, string, number, bigint];

  const result: TokenInfo = {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString(),
  };

  if (holder) {
    const balance = await agent.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [holder],
    }) as bigint;
    result.balance = balance.toString();
  }

  return result;
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  agent: MNTAgentKit,
  tokenAddress: Address,
  holder?: Address,
): Promise<string> {
  if (agent.demo) return "1000000000000000000000";

  const balance = await agent.client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [holder || agent.account.address],
  }) as bigint;

  return balance.toString();
}
