import type { MNTAgentKit } from "../../agent";
import { checkAllowance } from "./checkAllowance";
import { getApproveTx } from "./getApproveTx";
import { getGasLimit } from "./getGasLimit";

/**
 * Check allowance and get approve tx data if needed
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token to approve
 * @param amount - Amount to approve
 * @returns Allowance status and tx data
 */
export async function approveToken(
  agent: MNTAgentKit,
  tokenAddress: string,
  amount: string,
): Promise<{ allowanceExists: boolean; data: any }> {
  const chainIndex = agent.chain === "mainnet" ? "5000" : "5003";
  const walletAddress = agent.account.address;
  const spenderAddress = "0x1f16A607a7f3F3044E477abFFc8BD33952cE306b";

  const currentAllowance = await checkAllowance(
    agent,
    tokenAddress,
    walletAddress,
    spenderAddress,
  );

  if (currentAllowance >= BigInt(amount)) {
    console.log("Sufficient allowance already exists");
    return { allowanceExists: true, data: null };
  }

  console.log("Insufficient allowance, approving tokens...");

  // Get approve transaction data from OKX DEX API
  const approveData = await getApproveTx(tokenAddress, amount, chainIndex);

  // Get accurate gas limit using Onchain gateway API
  const gasLimit = await getGasLimit(
    walletAddress,
    tokenAddress,
    chainIndex,
    "0",
    approveData.data,
  );

  const txObject = {
    to: tokenAddress,
    data: approveData.data,
    gas: gasLimit,
  };

  return { allowanceExists: false, data: txObject };
}
