import { type Address, type Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { METH_TOKEN, WETH_TOKEN } from "../../constants/meth";
import { swapOnOpenOcean } from "../openocean";

/**
 * Swap mETH to WETH using DEX aggregator
 * This is the L2 way to exit mETH position - swap via DEX
 * @param agent - MNTAgentKit instance
 * @param amount - Amount of mETH to swap (in wei as string)
 * @param slippage - Slippage tolerance percentage (default 0.5%)
 * @returns Transaction hash
 */
export async function swapFromMeth(
  agent: MNTAgentKit,
  amount: string,
  slippage: number = 0.5,
): Promise<Hex> {
  const methTokenAddress = METH_TOKEN[agent.chain];
  const wethTokenAddress = WETH_TOKEN[agent.chain];

  if (methTokenAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return "0xdemo000000000000000000000000000000000000000000000000000000000001" as Hex;
    }
    throw new Error(
      `mETH not available on ${agent.chain}. Only available on mainnet.`,
    );
  }

  // Use OpenOcean aggregator to swap mETH -> WETH
  const result = await swapOnOpenOcean(
    agent,
    methTokenAddress as Address,
    wethTokenAddress as Address,
    amount,
    slippage.toString(),
  );

  return result.txHash as Hex;
}
