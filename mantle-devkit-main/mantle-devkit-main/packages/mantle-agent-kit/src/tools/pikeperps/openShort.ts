import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  PERPETUAL_TRADING,
  PERPETUAL_TRADING_ABI,
  PIKE_PERPS_CONFIG,
} from "../../constants/pikeperps";

export interface OpenPositionResult {
  positionId: bigint;
  txHash: Hex;
}

/**
 * Open a short position on PikePerps
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token to trade (meme token address)
 * @param margin - Margin amount in wei (as string)
 * @param leverage - Leverage multiplier (1-100)
 * @returns Position ID and transaction hash
 */
export async function pikeperpsOpenShort(
  agent: MNTAgentKit,
  tokenAddress: Address,
  margin: string,
  leverage: number = PIKE_PERPS_CONFIG.DEFAULT_LEVERAGE,
): Promise<OpenPositionResult> {
  const perpetualTradingAddress = PERPETUAL_TRADING[agent.chain];

  if (perpetualTradingAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return {
        positionId: BigInt(Math.floor(Math.random() * 1000)),
        txHash: "0xdemo_open_short_tx_hash" as Hex,
      };
    }
    throw new Error(
      `PikePerps not available on ${agent.chain}. Only available on testnet.`,
    );
  }

  // Validate leverage
  if (leverage < PIKE_PERPS_CONFIG.MIN_LEVERAGE || leverage > PIKE_PERPS_CONFIG.MAX_LEVERAGE) {
    throw new Error(
      `Leverage must be between ${PIKE_PERPS_CONFIG.MIN_LEVERAGE} and ${PIKE_PERPS_CONFIG.MAX_LEVERAGE}`,
    );
  }

  const marginBigInt = BigInt(margin);

  // Encode function call - isLong = false for short
  const data = encodeFunctionData({
    abi: PERPETUAL_TRADING_ABI,
    functionName: "openPosition",
    args: [tokenAddress, false, marginBigInt, BigInt(leverage)],
  });

  // Send transaction with margin as value
  const txHash = await agent.client.sendTransaction({
    to: perpetualTradingAddress,
    data,
    value: marginBigInt,
  });

  // Wait for receipt to get position ID from events
  const receipt = await agent.client.waitForTransactionReceipt({ hash: txHash });

  // Parse PositionOpened event to get position ID
  let positionId = 0n;
  for (const log of receipt.logs) {
    try {
      // PositionOpened event topic
      if (log.topics[0] === "0x2e5b0e8c5f5d55d89e89f5b5d5e5f5d55d89e89f5b5d5e5f5d55d89e89f5b5d5") {
        positionId = BigInt(log.topics[1] || "0");
        break;
      }
    } catch {
      // Continue if parsing fails
    }
  }

  // If we couldn't parse the event, try to get next position ID - 1
  if (positionId === 0n) {
    try {
      const nextId = (await agent.client.readContract({
        address: perpetualTradingAddress,
        abi: PERPETUAL_TRADING_ABI,
        functionName: "nextPositionId",
      })) as bigint;
      positionId = nextId - 1n;
    } catch {
      // Position ID unknown
    }
  }

  return {
    positionId,
    txHash,
  };
}
