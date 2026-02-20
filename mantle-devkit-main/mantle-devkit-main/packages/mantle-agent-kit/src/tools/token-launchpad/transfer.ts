import { type Address, type Hex, encodeFunctionData, erc20Abi } from "viem";
import type { MNTAgentKit } from "../../agent";
import { DEMO_TX_HASH } from "../../utils/demo/mockResponses";

/**
 * Transfer tokens
 */
export async function transferToken(
  agent: MNTAgentKit,
  tokenAddress: Address,
  to: Address,
  amount: string,
): Promise<Hex> {
  if (agent.demo) return DEMO_TX_HASH;

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, BigInt(amount)],
  });

  const txHash = await agent.client.sendTransaction({ to: tokenAddress, data });
  await agent.client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
