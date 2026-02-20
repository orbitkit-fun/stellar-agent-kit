import type { MNTAgentKit } from "../../agent";
import {
  PYTH_CONTRACT,
  PYTH_ABI,
  type PythPriceResponse,
  type PythTokenPriceResponse,
  resolvePriceFeedInput,
  isTokenAddress,
  TOKEN_ADDRESS_TO_PRICE_FEED,
} from "../../constants/pyth";

/**
 * Get price data from Pyth Network for a specific price feed
 * @param agent - MNTAgentKit instance
 * @param input - Token address, price feed ID (hex string), or pair name like "ETH/USD"
 * @returns Price data with formatted price
 */
export async function pythGetPrice(
  agent: MNTAgentKit,
  input: string,
): Promise<PythPriceResponse> {
  const pythAddress = PYTH_CONTRACT[agent.chain];

  // Resolve input (token address, pair name, or feed ID)
  const resolved = resolvePriceFeedInput(input);

  let priceFeedId: string;
  let pair: string;

  if (resolved) {
    priceFeedId = resolved.feedId;
    pair = resolved.pair;
  } else {
    // If not resolved, assume it's a raw feed ID
    priceFeedId = input;
    pair = input;
  }

  // Ensure the price feed ID has 0x prefix
  const feedId = priceFeedId.startsWith("0x")
    ? priceFeedId
    : `0x${priceFeedId}`;

  // Demo mode
  if (agent.demo) {
    return createMockPythResponse(pair, feedId);
  }

  try {
    // Get price from Pyth contract (getPriceUnsafe doesn't require staleness check)
    const priceData = (await agent.client.readContract({
      address: pythAddress,
      abi: PYTH_ABI,
      functionName: "getPriceUnsafe",
      args: [feedId as `0x${string}`],
    })) as { price: bigint; conf: bigint; expo: number; publishTime: bigint };

    const price = Number(priceData.price);
    const confidence = Number(priceData.conf);
    const exponent = priceData.expo;
    const publishTime = Number(priceData.publishTime);

    // Format the price with the exponent
    const formattedPrice = formatPythPrice(price, exponent);

    return {
      priceFeedId: feedId,
      pair,
      price: priceData.price.toString(),
      confidence: priceData.conf.toString(),
      exponent,
      publishTime,
      formattedPrice,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch price from Pyth: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get EMA (Exponential Moving Average) price from Pyth
 * @param agent - MNTAgentKit instance
 * @param input - Token address, price feed ID, or pair name
 * @returns EMA price data
 */
export async function pythGetEmaPrice(
  agent: MNTAgentKit,
  input: string,
): Promise<PythPriceResponse> {
  const pythAddress = PYTH_CONTRACT[agent.chain];

  // Resolve input (token address, pair name, or feed ID)
  const resolved = resolvePriceFeedInput(input);

  let priceFeedId: string;
  let pair: string;

  if (resolved) {
    priceFeedId = resolved.feedId;
    pair = resolved.pair;
  } else {
    priceFeedId = input;
    pair = input;
  }

  const feedId = priceFeedId.startsWith("0x")
    ? priceFeedId
    : `0x${priceFeedId}`;

  if (agent.demo) {
    return createMockPythResponse(pair, feedId);
  }

  try {
    const priceData = (await agent.client.readContract({
      address: pythAddress,
      abi: PYTH_ABI,
      functionName: "getEmaPrice",
      args: [feedId as `0x${string}`],
    })) as { price: bigint; conf: bigint; expo: number; publishTime: bigint };

    const formattedPrice = formatPythPrice(
      Number(priceData.price),
      priceData.expo,
    );

    return {
      priceFeedId: feedId,
      pair,
      price: priceData.price.toString(),
      confidence: priceData.conf.toString(),
      exponent: priceData.expo,
      publishTime: Number(priceData.publishTime),
      formattedPrice,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch EMA price from Pyth: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Format Pyth price with exponent
 */
function formatPythPrice(price: number, exponent: number): string {
  const adjustedPrice = price * Math.pow(10, exponent);
  // Format to reasonable decimal places
  if (adjustedPrice >= 1) {
    return adjustedPrice.toFixed(2);
  } else {
    return adjustedPrice.toFixed(8);
  }
}

/**
 * Get price for a token by its contract address
 * @param agent - MNTAgentKit instance
 * @param tokenAddress - Token contract address on Mantle (e.g., "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2" for USDC)
 * @returns Token price details including address, symbol, and USD price
 * @example
 * const price = await pythGetTokenPrice(agent, "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");
 * // Returns: { tokenAddress: "0x09Bc...", tokenSymbol: "USDC", priceUsd: "1.00", ... }
 */
export async function pythGetTokenPrice(
  agent: MNTAgentKit,
  tokenAddress: string,
): Promise<PythTokenPriceResponse> {
  // Validate it's a token address
  if (!isTokenAddress(tokenAddress)) {
    throw new Error(
      `Invalid token address format: ${tokenAddress}. Must be a valid Ethereum address (0x...)`,
    );
  }

  // Find token in mapping
  const normalizedAddress = tokenAddress.toLowerCase();
  let tokenInfo: { pair: string; feedId: string } | null = null;
  let originalAddress = tokenAddress;

  for (const [addr, info] of Object.entries(TOKEN_ADDRESS_TO_PRICE_FEED)) {
    if (addr.toLowerCase() === normalizedAddress) {
      tokenInfo = info;
      originalAddress = addr; // Keep original casing
      break;
    }
  }

  if (!tokenInfo) {
    throw new Error(
      `Token address not supported: ${tokenAddress}. Use pythGetSupportedTokenAddresses() to see available tokens.`,
    );
  }

  // Extract token symbol from pair (e.g., "USDC/USD" -> "USDC")
  const tokenSymbol = tokenInfo.pair.split("/")[0] || "UNKNOWN";
  const feedId = tokenInfo.feedId.startsWith("0x")
    ? tokenInfo.feedId
    : `0x${tokenInfo.feedId}`;

  // Demo mode
  if (agent.demo) {
    return createMockTokenPriceResponse(
      originalAddress,
      tokenSymbol,
      tokenInfo.pair,
      feedId,
    );
  }

  const pythAddress = PYTH_CONTRACT[agent.chain];

  try {
    const priceData = (await agent.client.readContract({
      address: pythAddress,
      abi: PYTH_ABI,
      functionName: "getPriceUnsafe",
      args: [feedId as `0x${string}`],
    })) as { price: bigint; conf: bigint; expo: number; publishTime: bigint };

    const formattedPrice = formatPythPrice(
      Number(priceData.price),
      priceData.expo,
    );
    const publishTime = Number(priceData.publishTime);

    return {
      tokenAddress: originalAddress,
      tokenSymbol,
      pair: tokenInfo.pair,
      priceFeedId: feedId,
      priceUsd: formattedPrice,
      confidence: priceData.conf.toString(),
      exponent: priceData.expo,
      publishTime,
      lastUpdated: new Date(publishTime * 1000).toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch price for token ${tokenAddress}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Create mock response for demo mode
 */
function createMockPythResponse(
  pair: string,
  feedId: string,
): PythPriceResponse {
  const mockPrices: Record<string, number> = {
    // Major Crypto
    "BTC/USD": 97500.0,
    "ETH/USD": 3450.0,
    "SOL/USD": 185.0,
    "BNB/USD": 680.0,
    "XRP/USD": 2.35,
    "ADA/USD": 0.95,
    "DOGE/USD": 0.32,
    "DOT/USD": 7.2,
    "AVAX/USD": 38.0,
    "MATIC/USD": 0.48,
    "LINK/USD": 22.0,
    "ATOM/USD": 9.5,
    "LTC/USD": 105.0,
    "UNI/USD": 13.5,
    "NEAR/USD": 5.2,
    "TRX/USD": 0.25,
    // L2
    "ARB/USD": 0.85,
    "OP/USD": 1.95,
    "MNT/USD": 0.85,
    "STRK/USD": 0.45,
    // DeFi
    "AAVE/USD": 285.0,
    "CRV/USD": 0.52,
    "MKR/USD": 1850.0,
    "SNX/USD": 2.8,
    "LDO/USD": 1.85,
    "GMX/USD": 28.0,
    "PENDLE/USD": 4.2,
    // Stablecoins
    "USDC/USD": 1.0,
    "USDT/USD": 1.0,
    "DAI/USD": 1.0,
    // LST
    "mETH/USD": 3500.0,
    "stETH/USD": 3450.0,
    "wstETH/USD": 4100.0,
    // Meme
    "SHIB/USD": 0.000022,
    "PEPE/USD": 0.000018,
    "BONK/USD": 0.000028,
    "WIF/USD": 1.85,
    // Commodities
    "XAU/USD": 2650.0,
    "XAG/USD": 31.0,
    // Forex
    "EUR/USD": 1.08,
    "GBP/USD": 1.27,
    "JPY/USD": 0.0067,
    // Equities
    "AAPL/USD": 248.0,
    "NVDA/USD": 138.0,
    "TSLA/USD": 385.0,
    "MSFT/USD": 425.0,
  };

  const price = mockPrices[pair] || 100.0;
  const decimals = price < 0.01 ? 8 : price < 1 ? 4 : 2;

  return {
    priceFeedId: feedId,
    pair,
    price: Math.floor(price * 1e8).toString(),
    confidence: "50000",
    exponent: -8,
    publishTime: Math.floor(Date.now() / 1000),
    formattedPrice: price.toFixed(decimals),
  };
}

/**
 * Create mock token price response for demo mode
 */
function createMockTokenPriceResponse(
  tokenAddress: string,
  tokenSymbol: string,
  pair: string,
  feedId: string,
): PythTokenPriceResponse {
  const mockPrices: Record<string, number> = {
    USDC: 1.0,
    USDT: 1.0,
    DAI: 1.0,
    ETH: 3450.0,
    WETH: 3450.0,
    BTC: 97500.0,
    WBTC: 97500.0,
    MNT: 0.85,
    WMNT: 0.85,
    mETH: 3500.0,
    PENDLE: 4.2,
  };

  const price = mockPrices[tokenSymbol] || 100.0;
  const publishTime = Math.floor(Date.now() / 1000);

  return {
    tokenAddress,
    tokenSymbol,
    pair,
    priceFeedId: feedId,
    priceUsd: price.toFixed(price < 1 ? 4 : 2),
    confidence: "50000",
    exponent: -8,
    publishTime,
    lastUpdated: new Date(publishTime * 1000).toISOString(),
  };
}
