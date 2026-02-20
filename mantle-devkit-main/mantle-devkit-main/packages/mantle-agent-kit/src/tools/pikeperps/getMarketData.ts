import { type Address, type Hex, parseAbiItem } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  PERPETUAL_TRADING,
  PERPETUAL_TRADING_ABI,
  BONDING_CURVE_MARKET,
  BONDING_CURVE_MARKET_ABI,
} from "../../constants/pikeperps";

export interface PikePerpsTrade {
  positionId: bigint;
  trader: Address;
  token: Address;
  isLong: boolean;
  size: bigint;
  margin: bigint;
  leverage: bigint;
  entryPrice: bigint;
  timestamp: number;
  txHash: Hex;
  blockNumber: bigint;
}

export interface PikePerpsMarketData {
  token: Address;
  currentPrice: bigint;
  hasPrice: boolean;
  isListed: boolean;
  curveProgress: bigint; // Percentage of tokens sold (0-10000)
  recentTrades: PikePerpsTrade[];
}

/**
 * Get market data for a token on PikePerps
 * Returns current price and recent trades
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token address to get market data for
 * @param limit - Maximum number of recent trades to return (default 20)
 * @returns Market data with price and recent trades
 */
export async function pikeperpsGetMarketData(
  agent: MNTAgentKit,
  tokenAddress: Address,
  limit: number = 20,
): Promise<PikePerpsMarketData> {
  const perpetualTradingAddress = PERPETUAL_TRADING[agent.chain];
  const bondingCurveAddress = BONDING_CURVE_MARKET[agent.chain];

  if (perpetualTradingAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return {
        token: tokenAddress,
        currentPrice: BigInt("100000000"), // $1.00 scaled by 1e8
        hasPrice: true,
        isListed: true,
        curveProgress: BigInt("5000"), // 50%
        recentTrades: [
          {
            positionId: 1n,
            trader: "0x0000000000000000000000000000000000000001" as Address,
            token: tokenAddress,
            isLong: true,
            size: BigInt("1000000000000000000"),
            margin: BigInt("100000000000000000"),
            leverage: 10n,
            entryPrice: BigInt("100000000"),
            timestamp: Math.floor(Date.now() / 1000) - 300,
            txHash: "0xdemo_trade_hash" as Hex,
            blockNumber: 1000n,
          },
        ],
      };
    }
    throw new Error(
      `PikePerps not available on ${agent.chain}. Only available on testnet.`,
    );
  }

  // Get current price from perpetual trading contract
  let currentPrice = 0n;
  let hasPrice = false;
  try {
    const [price, hasPriceResult] = (await agent.client.readContract({
      address: perpetualTradingAddress,
      abi: PERPETUAL_TRADING_ABI,
      functionName: "getCurrentPrice",
      args: [tokenAddress],
    })) as [bigint, boolean];
    currentPrice = price;
    hasPrice = hasPriceResult;
  } catch {
    // Price unavailable
  }

  // Check if token is listed on bonding curve
  let isListed = false;
  let curveProgress = 0n;
  if (bondingCurveAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      isListed = (await agent.client.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_MARKET_ABI,
        functionName: "isListed",
        args: [tokenAddress],
      })) as boolean;

      if (isListed) {
        curveProgress = (await agent.client.readContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_MARKET_ABI,
          functionName: "getCurveProgress",
          args: [tokenAddress],
        })) as bigint;
      }
    } catch {
      // Bonding curve data unavailable
    }
  }

  // Get recent trades from PositionOpened events
  const recentTrades: PikePerpsTrade[] = [];
  try {
    // Get recent blocks (last ~1000 blocks)
    const currentBlock = await agent.client.getBlockNumber();
    const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;

    const logs = await agent.client.getLogs({
      address: perpetualTradingAddress,
      event: parseAbiItem(
        "event PositionOpened(uint256 indexed positionId, address indexed user, address indexed token, bool isLong, uint256 size, uint256 margin, uint256 leverage, uint256 entryPrice)",
      ),
      args: {
        token: tokenAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // Get block timestamps for each trade
    const blockCache = new Map<bigint, number>();

    for (const log of logs.slice(-limit)) {
      let timestamp = 0;
      if (!blockCache.has(log.blockNumber)) {
        try {
          const block = await agent.client.getBlock({
            blockNumber: log.blockNumber,
          });
          timestamp = Number(block.timestamp);
          blockCache.set(log.blockNumber, timestamp);
        } catch {
          timestamp = Math.floor(Date.now() / 1000);
        }
      } else {
        timestamp = blockCache.get(log.blockNumber) || 0;
      }

      recentTrades.push({
        positionId: BigInt(log.topics[1] || "0"),
        trader: log.topics[2] as Address,
        token: tokenAddress,
        isLong: log.args.isLong || false,
        size: log.args.size || 0n,
        margin: log.args.margin || 0n,
        leverage: log.args.leverage || 0n,
        entryPrice: log.args.entryPrice || 0n,
        timestamp,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
      });
    }
  } catch (error) {
    console.warn("Failed to fetch recent trades:", error);
  }

  return {
    token: tokenAddress,
    currentPrice,
    hasPrice,
    isListed,
    curveProgress,
    recentTrades,
  };
}
