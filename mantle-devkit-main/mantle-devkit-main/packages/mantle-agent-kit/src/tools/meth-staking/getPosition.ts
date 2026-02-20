import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import { METH_TOKEN, METH_ABI, WETH_TOKEN, WMNT_TOKEN } from "../../constants/meth";

export interface MethPosition {
  methBalance: bigint; // Raw mETH balance in wei
  wethBalance: bigint; // WETH balance for mETH swaps (mETH is ETH-backed)
  wmntBalance: bigint; // WMNT balance for reference
  methTokenAddress: Address;
  wethTokenAddress: Address;
  wmntTokenAddress: Address;
}

/**
 * Get mETH position for a user
 * Returns mETH balance, WETH balance (for swaps), and WMNT balance
 * @param agent - MNTAgentKit instance
 * @param userAddress - User wallet address (optional, defaults to agent account)
 * @returns mETH position with balances
 */
export async function methGetPosition(
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<MethPosition> {
  const methTokenAddress = METH_TOKEN[agent.chain];
  const wethTokenAddress = WETH_TOKEN[agent.chain];
  const wmntTokenAddress = WMNT_TOKEN[agent.chain];
  const address = userAddress || agent.account.address;

  if (methTokenAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return {
        methBalance: BigInt("2500000000000000000"), // 2.5 mETH
        wethBalance: BigInt("1000000000000000000"), // 1 WETH
        wmntBalance: BigInt("5000000000000000000000"), // 5000 WMNT
        methTokenAddress,
        wethTokenAddress,
        wmntTokenAddress,
      };
    }
    throw new Error(
      `mETH not available on ${agent.chain}. Only available on mainnet.`,
    );
  }

  // Get mETH balance
  const methBalance = (await agent.client.readContract({
    address: methTokenAddress,
    abi: METH_ABI,
    functionName: "balanceOf",
    args: [address],
  })) as bigint;

  // Get WETH balance for mETH swaps (mETH is ETH-backed)
  let wethBalance = 0n;
  try {
    wethBalance = (await agent.client.readContract({
      address: wethTokenAddress,
      abi: METH_ABI, // Same ERC20 ABI works for WETH
      functionName: "balanceOf",
      args: [address],
    })) as bigint;
  } catch {
    // WETH balance query failed, continue with 0
  }

  // Get WMNT balance for reference
  let wmntBalance = 0n;
  try {
    wmntBalance = (await agent.client.readContract({
      address: wmntTokenAddress,
      abi: METH_ABI, // Same ERC20 ABI works for WMNT
      functionName: "balanceOf",
      args: [address],
    })) as bigint;
  } catch {
    // WMNT balance query failed, continue with 0
  }

  return {
    methBalance,
    wethBalance,
    wmntBalance,
    methTokenAddress,
    wethTokenAddress,
    wmntTokenAddress,
  };
}
