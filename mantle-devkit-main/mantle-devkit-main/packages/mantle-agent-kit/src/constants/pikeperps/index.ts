// PikePerps - Perpetual Trading on Mantle Network
// Supports long/short positions with up to 100x leverage
// Uses BondingCurveMarket for meme token pricing

// PerpetualTrading contract addresses
export const PERPETUAL_TRADING = {
  mainnet: "0x0000000000000000000000000000000000000000" as const, // Not deployed yet
  testnet: "0x8081b646f349c049f2d5e8a400057d411dd657bd" as const,
} as const;

// BondingCurveMarket for price feeds
export const BONDING_CURVE_MARKET = {
  mainnet: "0x0000000000000000000000000000000000000000" as const,
  testnet: "0x93b268325A9862645c82b32229f3B52264750Ca2" as const,
} as const;

// Trading configuration
export const PIKE_PERPS_CONFIG = {
  MAX_LEVERAGE: 100,
  DEFAULT_LEVERAGE: 10,
  MIN_LEVERAGE: 1,
  TRADING_FEE_BPS: 5, // 0.05%
  LIQUIDATION_REWARD_BPS: 500, // 5%
  PRICE_DECIMALS: 8, // Prices are scaled by 1e8
} as const;

// PerpetualTrading ABI
export const PERPETUAL_TRADING_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_pyth", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "positionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "pnl", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "exitPrice", type: "uint256" },
    ],
    name: "PositionClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "positionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "liquidationPrice", type: "uint256" },
    ],
    name: "PositionLiquidated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "positionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "bool", name: "isLong", type: "bool" },
      { indexed: false, internalType: "uint256", name: "size", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "margin", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "leverage", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "entryPrice", type: "uint256" },
    ],
    name: "PositionOpened",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "closePosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "getCurrentPrice",
    outputs: [
      { internalType: "uint256", name: "currentPrice", type: "uint256" },
      { internalType: "bool", name: "hasPrice", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "getLiquidationPrice",
    outputs: [{ internalType: "uint256", name: "liquidationPrice", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "getPosition",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "bool", name: "isLong", type: "bool" },
          { internalType: "uint256", name: "size", type: "uint256" },
          { internalType: "uint256", name: "margin", type: "uint256" },
          { internalType: "uint256", name: "leverage", type: "uint256" },
          { internalType: "uint256", name: "entryPrice", type: "uint256" },
          { internalType: "uint256", name: "entryTime", type: "uint256" },
          { internalType: "uint256", name: "lastFundingTime", type: "uint256" },
          { internalType: "bool", name: "isOpen", type: "bool" },
        ],
        internalType: "struct PerpetualTrading.Position",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "getPositionPnL",
    outputs: [
      { internalType: "uint256", name: "pnl", type: "uint256" },
      { internalType: "bool", name: "isProfit", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserPositions",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "liquidatePosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "maxLeverage",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minMarginBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextPositionId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "bool", name: "_isLong", type: "bool" },
      { internalType: "uint256", name: "_margin", type: "uint256" },
      { internalType: "uint256", name: "_leverage", type: "uint256" },
    ],
    name: "openPosition",
    outputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_positionId", type: "uint256" }],
    name: "shouldLiquidate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tradingFeeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// BondingCurveMarket ABI (for price queries)
export const BONDING_CURVE_MARKET_ABI = [
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "getCurrentPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "isListed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "getCurveProgress",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
