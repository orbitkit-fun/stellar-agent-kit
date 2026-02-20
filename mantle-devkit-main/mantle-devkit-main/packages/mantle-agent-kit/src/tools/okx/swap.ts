import type { Address, Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { ETH_ADDRESS } from "../../constants/okx";
import { approveToken, getGasLimit, getSwapTransaction } from "../../utils/okx";
import { createMockOkxSwapResponse } from "../../utils/demo/mockResponses";

/**
 * Execute token swap
 * @param fromTokenAddress - Source token address
 * @param toTokenAddress - Destination token address
 * @param amount - Amount to swap
 * @param slippagePercent - Maximum slippagePercent
 * @returns Transaction hash
 */
export async function executeSwap(
  agent: MNTAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippagePercent: string,
): Promise<{ data: any }> {
  if (agent.demo) {
    return createMockOkxSwapResponse(amount);
  }

  const chainIndex = agent.chain === "mainnet" ? "5000" : "5003";
  const walletAddress = agent.account.address;

  // 1. Check allowance and approve if necessary (skip for native token)
  if (fromTokenAddress !== ETH_ADDRESS) {
    const approval = await approveToken(agent, fromTokenAddress, amount);

    // If approval needed, sign and send approval tx
    if (!approval.allowanceExists && approval.data) {
      const approveTxHash = await agent.client.sendTransaction({
        to: approval.data.to as Address,
        data: approval.data.data as Hex,
        value: BigInt(0),
        gas: BigInt(approval.data.gas),
      });
      console.log(`Approval tx sent: ${approveTxHash}`);

      // Wait for approval tx to be confirmed
      const approveReceipt = await agent.client.waitForTransactionReceipt({
        hash: approveTxHash,
      });
      console.log(`Approval confirmed: ${approveReceipt.status}`);
    }
  }

  // 2. Get swap transaction data
  const swapData = await getSwapTransaction(
    fromTokenAddress,
    toTokenAddress,
    amount,
    walletAddress,
    chainIndex,
    slippagePercent,
  );

  const txData = swapData.tx;
  console.log("Swap TX data received");

  // 3. Get accurate gas limit
  const gasLimit = await getGasLimit(
    walletAddress,
    txData.to,
    chainIndex,
    txData.value || "0",
    txData.data,
  );
  console.log("Gas limit received");

  // 4. Sign and send transaction using viem
  const txHash = await agent.client.sendTransaction({
    to: txData.to as Address,
    data: txData.data as Hex,
    value: BigInt(txData.value || "0"),
    gas: BigInt(gasLimit),
  });
  console.log(`Swap tx sent: ${txHash}`);

  // Wait for swap tx to be confirmed
  const swapReceipt = await agent.client.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log(`Swap confirmed: ${swapReceipt.status}`);

  return {
    data: txHash,
  };
}
