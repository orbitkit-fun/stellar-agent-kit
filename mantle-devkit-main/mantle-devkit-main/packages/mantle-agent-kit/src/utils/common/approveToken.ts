import { erc20Abi, type Address, type Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { checkAllowance } from "./checkAllowance";

/**
 * Approve token spending for a spender address
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token contract address
 * @param spenderAddress - Spender address (DEX/protocol contract)
 * @param amount - Amount to approve (as string in smallest units)
 * @returns Transaction hash if approval was needed, null if already approved
 */
export async function approveToken(
  agent: MNTAgentKit,
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
): Promise<{ approved: boolean; txHash: string | null }> {
  const walletAddress = agent.account.address;

  // Check current allowance
  const currentAllowance = await checkAllowance(
    agent,
    tokenAddress,
    walletAddress,
    spenderAddress,
  );

  if (currentAllowance >= BigInt(amount)) {
    console.log("Sufficient allowance already exists");
    return { approved: true, txHash: null };
  }

  console.log("Insufficient allowance, approving tokens...");

  // Encode approve function call
  const { encodeFunctionData } = await import("viem");
  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [spenderAddress as Address, BigInt(amount)],
  });

  // Estimate gas
  const gasEstimate = await agent.client.estimateGas({
    account: agent.account,
    to: tokenAddress as Address,
    data: approveData as Hex,
  });

  // Send approval transaction
  const txHash = await agent.client.sendTransaction({
    to: tokenAddress as Address,
    data: approveData as Hex,
    value: BigInt(0),
    gas: gasEstimate,
  });

  console.log(`Approval tx sent: ${txHash}`);

  // Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(`Approval confirmed: ${receipt.status}`);

  return { approved: true, txHash };
}
