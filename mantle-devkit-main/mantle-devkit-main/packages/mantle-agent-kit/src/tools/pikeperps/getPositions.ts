import { type Address, type Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { PERPETUAL_TRADING, PERPETUAL_TRADING_ABI } from "../../constants/pikeperps";

export interface PikePerpsPosition {
  positionId: bigint;
  token: Address;
  isLong: boolean;
  size: bigint;
  margin: bigint;
  leverage: number;
  entryPrice: bigint;
  entryTime: bigint;
  currentPrice: bigint;
  pnl: bigint;
  isProfit: boolean;
  liquidationPrice: bigint;
  isOpen: boolean;
}

interface RawPosition {
  user: Address;
  token: Address;
  isLong: boolean;
  size: bigint;
  margin: bigint;
  leverage: bigint;
  entryPrice: bigint;
  entryTime: bigint;
  lastFundingTime: bigint;
  isOpen: boolean;
}

/**
 * Get all positions for a user on PikePerps
 * Returns detailed position data including PnL and liquidation prices
 * @param agent - MNTAgentKit instance
 * @param userAddress - User wallet address (optional, defaults to agent account)
 * @returns Array of positions with PnL and liquidation data
 */
export async function pikeperpsGetPositions(
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<PikePerpsPosition[]> {
  const perpetualTradingAddress = PERPETUAL_TRADING[agent.chain];
  const address = userAddress || agent.account.address;

  if (perpetualTradingAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return [
        {
          positionId: 1n,
          token: "0x0000000000000000000000000000000000000001" as Address,
          isLong: true,
          size: BigInt("1000000000000000000"), // 1 ETH equivalent
          margin: BigInt("100000000000000000"), // 0.1 ETH
          leverage: 10,
          entryPrice: BigInt("100000000"), // $1.00 scaled by 1e8
          entryTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
          currentPrice: BigInt("110000000"), // $1.10
          pnl: BigInt("10000000000000000"), // 0.01 ETH profit
          isProfit: true,
          liquidationPrice: BigInt("90000000"), // $0.90
          isOpen: true,
        },
      ];
    }
    throw new Error(
      `PikePerps not available on ${agent.chain}. Only available on testnet.`,
    );
  }

  // Get all position IDs for user
  const positionIds = (await agent.client.readContract({
    address: perpetualTradingAddress,
    abi: PERPETUAL_TRADING_ABI,
    functionName: "getUserPositions",
    args: [address],
  })) as bigint[];

  if (positionIds.length === 0) {
    return [];
  }

  const positions: PikePerpsPosition[] = [];

  // Fetch each position's details
  for (const positionId of positionIds) {
    try {
      // Get position details
      const rawPosition = (await agent.client.readContract({
        address: perpetualTradingAddress,
        abi: PERPETUAL_TRADING_ABI,
        functionName: "getPosition",
        args: [positionId],
      })) as RawPosition;

      // Skip closed positions
      if (!rawPosition.isOpen) {
        continue;
      }

      // Get PnL
      const [pnl, isProfit] = (await agent.client.readContract({
        address: perpetualTradingAddress,
        abi: PERPETUAL_TRADING_ABI,
        functionName: "getPositionPnL",
        args: [positionId],
      })) as [bigint, boolean];

      // Get liquidation price
      const liquidationPrice = (await agent.client.readContract({
        address: perpetualTradingAddress,
        abi: PERPETUAL_TRADING_ABI,
        functionName: "getLiquidationPrice",
        args: [positionId],
      })) as bigint;

      // Get current price
      let currentPrice = 0n;
      try {
        const [price, hasPrice] = (await agent.client.readContract({
          address: perpetualTradingAddress,
          abi: PERPETUAL_TRADING_ABI,
          functionName: "getCurrentPrice",
          args: [rawPosition.token],
        })) as [bigint, boolean];
        if (hasPrice) {
          currentPrice = price;
        }
      } catch {
        // Use entry price if current price unavailable
        currentPrice = rawPosition.entryPrice;
      }

      positions.push({
        positionId,
        token: rawPosition.token,
        isLong: rawPosition.isLong,
        size: rawPosition.size,
        margin: rawPosition.margin,
        leverage: Number(rawPosition.leverage),
        entryPrice: rawPosition.entryPrice,
        entryTime: rawPosition.entryTime,
        currentPrice,
        pnl,
        isProfit,
        liquidationPrice,
        isOpen: rawPosition.isOpen,
      });
    } catch (error) {
      console.warn(`Failed to fetch position ${positionId}:`, error);
    }
  }

  return positions;
}
