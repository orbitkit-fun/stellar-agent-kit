import { type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { PERPETUAL_TRADING, PERPETUAL_TRADING_ABI } from "../../constants/pikeperps";

/**
 * Close an existing position on PikePerps
 * @param agent - MNTAgentKit instance
 * @param positionId - Position ID to close
 * @returns Transaction hash
 */
export async function pikeperpsClosePosition(
  agent: MNTAgentKit,
  positionId: bigint,
): Promise<Hex> {
  const perpetualTradingAddress = PERPETUAL_TRADING[agent.chain];

  if (perpetualTradingAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return "0xdemo_close_position_tx_hash" as Hex;
    }
    throw new Error(
      `PikePerps not available on ${agent.chain}. Only available on testnet.`,
    );
  }

  // Encode function call
  const data = encodeFunctionData({
    abi: PERPETUAL_TRADING_ABI,
    functionName: "closePosition",
    args: [positionId],
  });

  // Send transaction
  const txHash = await agent.client.sendTransaction({
    to: perpetualTradingAddress,
    data,
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}
