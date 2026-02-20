export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logoUrl?: string
}

export const TOKENS: Record<string, Record<string, Token>> = {
  mainnet: {
    MNT: {
      symbol: "MNT",
      name: "Mantle",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
    },
    WMNT: {
      symbol: "WMNT",
      name: "Wrapped Mantle",
      address: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
      decimals: 18,
    },
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      decimals: 6,
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      decimals: 6,
    },
    WETH: {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
      decimals: 18,
    },
    mETH: {
      symbol: "mETH",
      name: "Mantle Staked ETH",
      address: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
      decimals: 18,
    },
  },
  testnet: {
    MNT: {
      symbol: "MNT",
      name: "Mantle",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
    },
    WMNT: {
      symbol: "WMNT",
      name: "Wrapped Mantle",
      address: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
      decimals: 18,
    },
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      decimals: 6,
    },
  },
}

export const FEE_TIERS = [
  { value: 100, label: "0.01% - Best for stable pairs" },
  { value: 500, label: "0.05% - Low volatility pairs" },
  { value: 3000, label: "0.3% - Standard pairs" },
  { value: 10000, label: "1% - High volatility pairs" },
]

export const PROTOCOLS = [
  {
    id: "agni",
    name: "Agni Finance",
    description: "Primary DEX on Mantle with deep liquidity",
    color: "#00D4FF",
  },
  {
    id: "merchantmoe",
    name: "Merchant Moe",
    description: "Alternative DEX with competitive rates",
    color: "#FF6B35",
  },
  {
    id: "openocean",
    name: "OpenOcean",
    description: "DEX aggregator for best prices (mainnet only)",
    color: "#00FF88",
  },
]

export function getTokensByNetwork(network: string): Token[] {
  return Object.values(TOKENS[network] || TOKENS.mainnet)
}

export function getTokenBySymbol(network: string, symbol: string): Token | undefined {
  return TOKENS[network]?.[symbol] || TOKENS.mainnet?.[symbol]
}
