# Mantle Agent Kit SDK

TypeScript SDK for seamless integration with DeFi protocols on Mantle Network. Provides unified interfaces for swaps, lending, liquid staking, perpetual trading, and cross-chain operations.

Part of [Mantle DevKit](https://mantle-devkit.vercel.app) - the complete developer suite for Mantle.

## Installation

```bash
npm install mantle-agent-kit-sdk
# or
bun install mantle-agent-kit-sdk
```

## Quick Start

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

// Initialize agent with private key and network
const agent = new MNTAgentKit("0xYOUR_PRIVATE_KEY", "mainnet");

// Initialize with platform validation (validates APP_ID from environment)
await agent.initialize();

// Execute a native token transfer
const txHash = await agent.sendTransaction(
  "0xRecipientAddress",
  "1000000000000000000" // 1 MNT in wei
);
```

## Supported Protocols

| Protocol | Network | Description |
|----------|---------|-------------|
| **OKX DEX** | Mainnet | Multi-source liquidity aggregation |
| **OpenOcean** | Mainnet | Cross-DEX aggregation |
| **Agni Finance** | Mainnet | Concentrated liquidity DEX (Uniswap V3) |
| **Merchant Moe** | Mainnet | Liquidity Book DEX (TraderJoe V2.1) |
| **Uniswap V3** | Mainnet | Canonical Uniswap V3 contracts |
| **Lendle** | Mainnet | Lending market (Aave V2 fork) |
| **mETH Protocol** | Mainnet | Liquid staking token |
| **PikePerps** | Testnet | Perpetual futures trading (up to 100x) |
| **Squid Router** | Mainnet | Cross-chain swaps via Axelar |
| **Pyth Network** | Both | Real-time price oracles (80+ assets) |
| **Token Launchpad** | Both | Deploy ERC20 tokens & RWAs |
| **NFT Launchpad** | Both | Deploy & mint ERC721 NFT collections |

## API Reference

### Token Transfers

```typescript
await agent.sendTransaction(
  recipientAddress: Address,
  amount: string // in wei
): Promise<Address>
```

---

### DEX Operations

#### OKX DEX Aggregator

```typescript
// Get optimal swap quote
const quote = await agent.getSwapQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippagePercentage?: string // default: "0.5"
);

// Execute swap
const txHash = await agent.executeSwap(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippagePercentage?: string // default: "0.5"
);
```

#### OpenOcean

```typescript
const quote = await agent.getOpenOceanQuote(
  fromToken: Address,
  toToken: Address,
  amount: string
);

const txHash = await agent.swapOnOpenOcean(
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage?: number // default: 0.5
);
```

#### Uniswap V3

```typescript
const quote = await agent.getUniswapQuote(
  fromToken: Address,
  toToken: Address,
  amount: string
);

const txHash = await agent.swapOnUniswap(
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage?: number // default: 0.5
);
```

#### Agni Finance

```typescript
const txHash = await agent.agniSwap(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent?: number, // default: 0.5
  feeTier?: number // optional: 500, 3000, 10000
);
```

#### Merchant Moe

```typescript
const txHash = await agent.merchantMoeSwap(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent?: number // default: 0.5
);
```

---

### Lendle Lending Protocol

#### Supply Assets

```typescript
const txHash = await agent.lendleSupply(
  tokenAddress: Address,
  amount: string
);
```

#### Withdraw Assets

```typescript
const txHash = await agent.lendleWithdraw(
  tokenAddress: Address,
  amount: string,
  to?: Address // optional recipient
);
```

#### Borrow Assets

```typescript
const txHash = await agent.lendleBorrow(
  tokenAddress: Address,
  amount: string,
  interestRateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address
);
```

#### Repay Debt

```typescript
const txHash = await agent.lendleRepay(
  tokenAddress: Address,
  amount: string,
  rateMode?: 1 | 2, // 1 = stable, 2 = variable (default)
  onBehalfOf?: Address
);
```

#### View Account Data

```typescript
const accountData = await agent.lendleGetUserAccountData(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   totalCollateralETH: bigint,
//   totalDebtETH: bigint,
//   availableBorrowsETH: bigint,
//   currentLiquidationThreshold: bigint,
//   ltv: bigint,
//   healthFactor: bigint
// }
```

#### View All Positions

```typescript
const positions = await agent.lendleGetPositions(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   positions: LendlePosition[],
//   totalSupplied: bigint,
//   totalDebt: bigint
// }
```

---

### mETH Protocol (Liquid Staking)

```typescript
// Get mETH token address
const methAddress = agent.getMethTokenAddress();
// Returns: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0 (mainnet)

// View mETH position (balances)
const position = await agent.methGetPosition(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: {
//   methBalance: bigint,
//   wethBalance: bigint,
//   wmntBalance: bigint,
//   methTokenAddress: Address,
//   wethTokenAddress: Address,
//   wmntTokenAddress: Address
// }

// Swap WETH to mETH via DEX
const txHash = await agent.swapToMeth(
  amount: string, // WETH amount in wei
  slippage?: number // default: 0.5
);

// Swap mETH to WETH via DEX
const txHash = await agent.swapFromMeth(
  amount: string, // mETH amount in wei
  slippage?: number // default: 0.5
);
```

> **Note**: Actual ETH staking happens on Ethereum L1. On Mantle L2, you can swap to/from mETH via DEX or use it in DeFi protocols. To stake ETH for mETH on L1, use the [official mETH interface](https://www.mantle-meth.xyz/).

---

### PikePerps - Perpetual Trading

Trade perpetual futures with up to 100x leverage on meme tokens.

> **Network**: Mantle Sepolia Testnet only

#### Open Long Position

```typescript
const result = await agent.pikeperpsOpenLong(
  tokenAddress: Address, // Meme token to trade
  margin: string,        // Margin in wei
  leverage?: number      // 1-100, default: 10
);
// Returns: { positionId: bigint, txHash: Hex }
```

#### Open Short Position

```typescript
const result = await agent.pikeperpsOpenShort(
  tokenAddress: Address,
  margin: string,
  leverage?: number // 1-100, default: 10
);
// Returns: { positionId: bigint, txHash: Hex }
```

#### Close Position

```typescript
const txHash = await agent.pikeperpsClosePosition(
  positionId: bigint
);
```

#### View Positions

```typescript
const positions = await agent.pikeperpsGetPositions(
  userAddress?: Address // optional, defaults to agent account
);
// Returns: PikePerpsPosition[] with:
//   positionId, token, isLong, size, margin, leverage,
//   entryPrice, currentPrice, pnl, isProfit,
//   liquidationPrice, isOpen
```

#### Get Market Data

```typescript
const marketData = await agent.pikeperpsGetMarketData(
  tokenAddress: Address,
  limit?: number // default: 20
);
// Returns: {
//   token, currentPrice, hasPrice, isListed, curveProgress,
//   recentTrades: PikePerpsTrade[]
// }
```

---

### Cross-Chain Operations (Squid Router)

```typescript
// Get cross-chain route
const route = await agent.getSquidRoute(
  fromToken: Address,
  toToken: Address,
  fromChain: number, // LayerZero chain ID
  toChain: number,
  amount: string,
  slippage?: number // default: 1
);

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken: Address,
  toToken: Address,
  fromChain: number,
  toChain: number,
  amount: string,
  slippage?: number // default: 1
);
```

---

### Pyth Network - Price Oracles

Real-time price feeds for 80+ assets including crypto, forex, commodities, and equities.

**All Pyth functions accept three input types:**
- **Pair name**: `"ETH/USD"`, `"BTC/USD"`, `"MNT/USD"`
- **Token address**: `"0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2"` (USDC on Mantle)
- **Price feed ID**: `"0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"`

#### Get Single Price

```typescript
// Using pair name
const price = await agent.pythGetPrice("ETH/USD");

// Using token address (USDC on Mantle)
const usdcPrice = await agent.pythGetPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");

// Using mETH token address
const methPrice = await agent.pythGetPrice("0xcDA86A272531e8640cD7F1a92c01839911B90bb0");

// Returns: PythPriceResponse
// {
//   priceFeedId: string,    // "0xff61491a..."
//   pair: string,           // "ETH/USD"
//   price: string,          // Raw price (e.g., "345000000000")
//   confidence: string,     // Confidence interval
//   exponent: number,       // Price exponent (e.g., -8)
//   publishTime: number,    // Unix timestamp
//   formattedPrice: string  // Human readable (e.g., "3450.00")
// }
```

#### Get EMA Price

```typescript
const emaPrice = await agent.pythGetEmaPrice("ETH/USD");
// Also accepts token addresses
const emaByAddress = await agent.pythGetEmaPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");
// Returns: PythPriceResponse (same structure as above)
```

#### Get Token Price by Address

Pass any token contract address and get full price details:

```typescript
const price = await agent.pythGetTokenPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");

// Returns: PythTokenPriceResponse
// {
//   tokenAddress: "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2",
//   tokenSymbol: "USDC",
//   pair: "USDC/USD",
//   priceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
//   priceUsd: "1.00",
//   confidence: "50000",
//   exponent: -8,
//   publishTime: 1704700800,
//   lastUpdated: "2024-01-08T12:00:00.000Z"
// }

// More examples
const methPrice = await agent.pythGetTokenPrice("0xcDA86A272531e8640cD7F1a92c01839911B90bb0"); // mETH
const wethPrice = await agent.pythGetTokenPrice("0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111"); // WETH
const wmntPrice = await agent.pythGetTokenPrice("0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"); // WMNT
```

#### Get Multiple Prices

```typescript
// Mix pair names and token addresses
const prices = await agent.pythGetMultiplePrices([
  "BTC/USD",                                      // pair name
  "ETH/USD",                                      // pair name
  "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2", // USDC address
  "0xcDA86A272531e8640cD7F1a92c01839911B90bb0", // mETH address
]);
// Returns: PythPriceResponse[]
```

#### Get Supported Price Feeds

```typescript
const feeds = agent.pythGetSupportedPriceFeeds();
// Returns: Record<string, string>
// {
//   "BTC/USD": "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
//   "ETH/USD": "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
//   ... 80+ more
// }
```

#### Get Supported Token Addresses

```typescript
const addresses = agent.pythGetSupportedTokenAddresses();
// Returns: Record<string, string>
// {
//   "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2": "USDC/USD",
//   "0xcDA86A272531e8640cD7F1a92c01839911B90bb0": "mETH/USD",
//   "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8": "MNT/USD",
//   ... more Mantle tokens
// }
```

#### Check Price Feed Exists

```typescript
// Works with pair names or token addresses
const exists = await agent.pythPriceFeedExists("ETH/USD");
const existsByAddress = await agent.pythPriceFeedExists("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");
// Returns: boolean
```

#### Supported Token Addresses (Mantle Network)

| Token | Address | Price Feed |
|-------|---------|------------|
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | MNT/USD |
| WETH | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | ETH/USD |
| USDC | `0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2` | USDC/USD |
| USDT | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | USDT/USD |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | mETH/USD |
| WBTC | `0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2` | WBTC/USD |
| FBTC | `0xc96de26018a54d51c097160568752c4e3bd6c364` | BTC/USD |
| PENDLE | `0xf83bcc06D6A4A5682adeCA11CF9500f67bFe61AE` | PENDLE/USD |

#### Supported Asset Categories

| Category | Examples |
|----------|----------|
| **Crypto (50+)** | BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, LINK, UNI, AAVE... |
| **Layer 2** | ARB, OP, MNT, STRK, IMX |
| **DeFi** | AAVE, CRV, MKR, SNX, LDO, GMX, PENDLE |
| **Stablecoins** | USDC, USDT, DAI, FRAX, BUSD |
| **LST Tokens** | stETH, wstETH, cbETH, rETH, mETH |
| **Meme Coins** | SHIB, PEPE, BONK, WIF, FLOKI |
| **Forex** | EUR/USD, GBP/USD, JPY/USD |
| **Commodities** | XAU (Gold), XAG (Silver), WTI, BRENT |
| **Equities** | AAPL, NVDA, TSLA, MSFT, GOOGL, AMZN |

---

### Token Launchpad

Deploy ERC20 tokens and RWA (Real World Asset) tokens with supply minted to your address.

#### Deploy Standard Token

```typescript
const result = await agent.deployStandardToken(
  name: string,    // e.g., "My Token"
  symbol: string,  // e.g., "MTK"
  supply: string   // Human readable, e.g., "1000000" (1M tokens)
);

// Returns: TokenDeploymentResult
// {
//   tokenAddress: string,  // Deployed contract address
//   txHash: string,        // Transaction hash
//   name: string,
//   symbol: string,
//   decimals: number,      // Always 18
//   totalSupply: string,   // Supply in wei
//   mintedTo: string,      // Your wallet address
//   tokenType: "standard"
// }
```

#### Deploy RWA Token

```typescript
const result = await agent.deployRWAToken(
  name: string,      // e.g., "Manhattan Property Token"
  symbol: string,    // e.g., "MPT"
  supply: string,    // Fractional shares, e.g., "10000"
  assetType: string, // "Real Estate" | "Commodities" | "Securities" | "Art"
  assetId?: string   // External reference, e.g., "PROP-NYC-001"
);

// Returns: TokenDeploymentResult
// {
//   tokenAddress: string,
//   txHash: string,
//   name: string,
//   symbol: string,
//   decimals: number,
//   totalSupply: string,
//   mintedTo: string,
//   tokenType: "rwa",
//   assetType: string,   // "Real Estate"
//   assetId: string      // "PROP-NYC-001"
// }
```

#### Generic Token Deployment

```typescript
const result = await agent.deployToken(
  name: string,
  symbol: string,
  supply: string,
  tokenType?: "standard" | "rwa",  // default: "standard"
  assetType?: string,              // For RWA only
  assetId?: string                 // For RWA only
);
```

#### Get Token Info

```typescript
const info = await agent.getTokenInfo(
  tokenAddress: Address,
  holder?: Address  // Optional: get balance for this address
);

// Returns: TokenInfo
// {
//   address: string,
//   name: string,
//   symbol: string,
//   decimals: number,
//   totalSupply: string,
//   balance?: string  // If holder provided
// }
```

#### Get Token Balance

```typescript
const balance = await agent.getTokenBalance(
  tokenAddress: Address,
  holder?: Address  // Defaults to agent address
);
// Returns: string (balance in wei)
```

#### Transfer Tokens

```typescript
const txHash = await agent.transferToken(
  tokenAddress: Address,
  to: Address,
  amount: string  // Amount in wei
);
// Returns: Hex (transaction hash)
```

---

### NFT Launchpad

Deploy ERC721 NFT collections and mint NFTs.

#### Deploy NFT Collection

```typescript
const result = await agent.deployNFTCollection({
  name: string,      // e.g., "My NFT Collection"
  symbol: string,    // e.g., "MNFT"
  baseURI: string,   // e.g., "ipfs://QmXXX/"
  maxSupply?: number // 0 for unlimited
});

// Returns: NFTCollectionDeploymentResult
// {
//   collectionAddress: string,
//   txHash: string,
//   name: string,
//   symbol: string,
//   baseURI: string,
//   maxSupply: number,
//   deployer: string
// }
```

#### Deploy with Preset

```typescript
const result = await agent.deployNFTCollectionWithPreset(
  preset: "pfp" | "art" | "membership" | "unlimited",
  name: string,
  symbol: string,
  baseURI: string
);
// Presets: pfp=10000, art=1000, membership=100, unlimited=0
```

#### Mint NFT

```typescript
const result = await agent.mintNFT(
  collectionAddress: Address,
  to?: Address  // Defaults to agent address
);

// Returns: NFTMintResult
// {
//   txHash: string,
//   tokenId: string,
//   collectionAddress: string,
//   to: string
// }
```

#### Batch Mint

```typescript
const result = await agent.batchMintNFT(
  collectionAddress: Address,
  to: Address,
  quantity: number
);

// Returns:
// {
//   txHash: Hex,
//   startTokenId: string,
//   quantity: number
// }
```

#### Get Collection Info

```typescript
const info = await agent.getNFTCollectionInfo(
  collectionAddress: Address,
  holder?: Address
);

// Returns: NFTCollectionInfo
// {
//   address: string,
//   name: string,
//   symbol: string,
//   totalSupply: string,
//   balanceOf?: string  // If holder provided
// }
```

#### Get Token Info

```typescript
const info = await agent.getNFTTokenInfo(
  collectionAddress: Address,
  tokenId: string
);

// Returns: NFTTokenInfo
// {
//   collectionAddress: string,
//   tokenId: string,
//   owner: string,
//   tokenURI: string
// }
```

#### Transfer NFT

```typescript
// Standard transfer
const txHash = await agent.transferNFT(
  collectionAddress: Address,
  to: Address,
  tokenId: string
);

// Safe transfer (checks recipient)
const txHash = await agent.safeTransferNFT(
  collectionAddress: Address,
  to: Address,
  tokenId: string
);
```

#### Approve NFT

```typescript
// Approve single NFT
const txHash = await agent.approveNFT(
  collectionAddress: Address,
  approved: Address,
  tokenId: string
);

// Approve all NFTs in collection
const txHash = await agent.setApprovalForAllNFT(
  collectionAddress: Address,
  operator: Address,
  approved: boolean
);
```

---

## Configuration

### Environment Variables

#### Platform Configuration (Required)

```env
APP_ID=your_app_id_here

# Optional: Custom platform URL (defaults to https://mantle-devkit.vercel.app)
PLATFORM_URL=https://mantle-devkit.vercel.app
```

#### OKX DEX (Required for OKX methods)

```env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
```

### Network Configuration

| Network | Chain ID | Usage |
|---------|----------|-------|
| Mainnet | 5000 | Production (DEX, Lendle, mETH) |
| Testnet (Sepolia) | 5003 | Development, PikePerps |

```typescript
const mainnetAgent = new MNTAgentKit(privateKey, "mainnet");
const testnetAgent = new MNTAgentKit(privateKey, "testnet");
```

### Demo/Simulation Mode

```typescript
// Initialize agent in demo mode
const demoAgent = new MNTAgentKit(privateKey, "testnet-demo");

// All operations return mock responses
const result = await demoAgent.swapOnUniswap(tokenA, tokenB, amount);
// Returns: { txHash: "0xdemo...", demo: true, message: "..." }
```

---

## Contract Addresses

### Mainnet (Chain ID: 5000)

| Protocol | Contract | Address |
|----------|----------|---------|
| **Pyth Network** | Oracle | `0xA2aa501b19aff244D90cc15a4Cf739D2725B5729` |
| **mETH** | Token | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` |
| **WETH** | Token | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` |
| **WMNT** | Token | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` |
| **Lendle** | LendingPool | `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3` |
| **Lendle** | DataProvider | `0x552b9e4bae485C4B7F540777d7D25614CdB84773` |
| **Agni** | Factory | `0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035` |
| **Agni** | SwapRouter | `0x319B69888b0d11cEC22caA5034e25FfFBDc88421` |
| **Merchant Moe** | LBRouter | `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a` |
| **Uniswap V3** | SwapRouter | `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45` |

### Testnet (Chain ID: 5003)

| Protocol | Contract | Address |
|----------|----------|---------|
| **Pyth Network** | Oracle | `0x98046Bd286715D3B0BC227Dd7a956b83D8978603` |
| **PikePerps** | PerpetualTrading | `0x8081b646f349c049f2d5e8a400057d411dd657bd` |
| **PikePerps** | BondingCurveMarket | `0x93b268325A9862645c82b32229f3B52264750Ca2` |

Verify addresses on [Mantlescan](https://mantlescan.xyz).

---

## Advanced Usage

### Accessing Protocol Constants

```typescript
import {
  AgniConstants,
  LendleConstants,
  MerchantMoeConstants,
  MethConstants,
  UniswapConstants,
  PikePerpsConstants,
} from "mantle-agent-kit-sdk";

// Example: Get Lendle pool address
const poolAddress = LendleConstants.LENDING_POOL.mainnet;

// Example: Get PikePerps contract
const perpsAddress = PikePerpsConstants.PERPETUAL_TRADING.testnet;

// Example: Get mETH/WETH/WMNT addresses
const methToken = MethConstants.METH_TOKEN.mainnet;
const wethToken = MethConstants.WETH_TOKEN.mainnet;
const wmntToken = MethConstants.WMNT_TOKEN.mainnet;
```

### Type Definitions

```typescript
import type {
  UserAccountData,
  ProjectConfig,
  LendlePosition,
  LendlePositionsResult,
  MethPosition,
  PikePerpsPosition,
  PikePerpsMarketData,
  PikePerpsTrade,
} from "mantle-agent-kit-sdk";
```

### Project Configuration

```typescript
const agent = new MNTAgentKit(privateKey, "mainnet");
await agent.initialize();

// Access validated project config
console.log("Project Name:", agent.projectConfig?.name);
console.log("Payout Address:", agent.projectConfig?.payTo);
console.log("Network:", agent.projectConfig?.network);
console.log("Status:", agent.projectConfig?.status);
```

---

## Development

### Build from Source

```bash
# Install dependencies
bun install

# Build package
bun run build

# Type check
bun run typecheck
```

### Package Structure

```
dist/
├── index.js          # ESM build
├── index.cjs         # CommonJS build
├── index.d.ts        # TypeScript declarations
└── *.map             # Source maps
```

---

## License

MIT

## Resources

- [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app)
- [Mantle Network Documentation](https://docs.mantle.xyz/)
- [Mantlescan Explorer](https://mantlescan.xyz/)
- [Lendle Protocol](https://lendle.xyz/)
- [Agni Finance](https://agni.finance/)
- [Merchant Moe](https://merchantmoe.com/)
- [mETH Protocol](https://www.mantle-meth.xyz/)
