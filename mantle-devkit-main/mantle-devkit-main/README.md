# Mantle DevKit

The complete developer suite for Mantle Network. Build payments, DeFi applications, and AI-powered blockchain agents with production-ready SDKs and tools.

## Overview
<img width="1920" height="1080" alt="Mantle Devkit" src="https://github.com/user-attachments/assets/b54e381f-eef9-4633-8cd0-4e1292a6d4d4" />

Mantle DevKit is a comprehensive toolkit designed to accelerate development on Mantle Network. Whether you're building monetized APIs, integrating DeFi protocols, or creating AI agents that interact with blockchain, Mantle DevKit provides the infrastructure you need.

### What's Included

- **x402-mantle-sdk** - Monetize your APIs with native blockchain payments using the HTTP 402 protocol
- **mantle-agent-kit-sdk** - Build AI agents and applications with unified DeFi protocol integrations
- **create-mantle-devkit-app** - CLI scaffolding tool to bootstrap x402 and Agent Kit projects in seconds
- **mantle-devkit-mcp** - MCP server for Claude AI integration with Mantle Network

## Packages

### x402-mantle-sdk

Complete SDK for implementing HTTP 402 Payment Required protocol on Mantle Network. Enables developers to monetize APIs by requiring cryptocurrency payments before granting access to protected resources. Includes server middleware for popular frameworks (Hono, Express, Next.js), client-side payment handling with automatic wallet integration, and React components for seamless UI integration.

```bash
npm install x402-mantle-sdk
```

[![npm](https://img.shields.io/npm/v/x402-mantle-sdk)](https://www.npmjs.com/package/x402-mantle-sdk)

---

### mantle-agent-kit-sdk

TypeScript SDK providing a unified interface to interact with DeFi protocols on Mantle Network. Designed for building AI agents, trading bots, and DeFi applications with a single, consistent API. Supports DEX aggregators (OKX, OpenOcean), native DEXs (Agni, Merchant Moe, Uniswap V3), lending protocols (Lendle), liquid staking (mETH), cross-chain operations (Squid Router), Pyth Network price oracles (80+ assets), perpetual trading (PikePerps), token launchpad (ERC20 & RWA), and NFT launchpad (ERC721).

```bash
npm install mantle-agent-kit-sdk
```

[![npm](https://img.shields.io/npm/v/mantle-agent-kit-sdk)](https://www.npmjs.com/package/mantle-agent-kit-sdk)

---

### create-mantle-devkit-app

CLI tool for scaffolding production-ready Mantle applications. Supports two project types:

**Agent Kit** - DeFi swap interface with Agni Finance, Merchant Moe, and OpenOcean integrations. Real-time price quotes via Pyth Oracle.

**x402 API** - Pay-per-request API templates with HTTP 402 payment middleware. Available in fullstack (Next.js) and backend-only (Hono/Express) variants.

```bash
npx create-mantle-devkit-app my-app
```

[![npm](https://img.shields.io/npm/v/create-mantle-devkit-app)](https://www.npmjs.com/package/create-mantle-devkit-app)

---

### mantle-devkit-mcp

Model Context Protocol (MCP) server that provides Claude AI with deep knowledge of Mantle Network, SDK documentation, and DeFi protocol context. Enables Claude to assist with Mantle development, generate accurate code, and provide protocol-specific guidance. Integrates seamlessly with Claude Code and Claude Desktop.

---

## Package Summary

| Package | Description | Install | npm |
|---------|-------------|---------|-----|
| `x402-mantle-sdk` | HTTP 402 payment middleware for monetizing APIs | `npm i x402-mantle-sdk` | [npm](https://www.npmjs.com/package/x402-mantle-sdk) |
| `mantle-agent-kit-sdk` | Unified DeFi protocol integrations for AI agents | `npm i mantle-agent-kit-sdk` | [npm](https://www.npmjs.com/package/mantle-agent-kit-sdk) |
| `create-mantle-devkit-app` | CLI to scaffold x402 and Agent Kit applications | `npx create-mantle-devkit-app` | [npm](https://www.npmjs.com/package/create-mantle-devkit-app) |
| `mantle-devkit-mcp` | MCP server for Claude AI integration | See docs | - |

## Quick Start

### x402 - API Monetization

```bash
npm install x402-mantle-sdk
```

```typescript
// Server - Protect API routes with payments
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

// Client - Automatic payment handling
import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch('https://api.example.com/api/premium')
```

### Agent Kit - DeFi Integrations

```bash
npm install mantle-agent-kit-sdk
```

```typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk"

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet")
await agent.initialize()

// DEX Swap
await agent.agniSwap(tokenIn, tokenOut, amount)

// Lending
await agent.lendleSupply(token, amount)

// Cross-chain
await agent.crossChainSwapViaSquid(fromToken, toToken, fromChain, toChain, amount)
```

## x402 SDK

### Features

- HTTP 402 Payment Required protocol
- Server middleware for Hono, Express, Next.js
- Client-side payment modal
- React components
- Multiple tokens: MNT, USDC, USDT, mETH, WMNT
- Automatic 0.5% platform fee splitting

### Server Setup

```typescript
import { x402 } from 'x402-mantle-sdk/server'

// Protect routes with payment
app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))

app.get('/api/premium', (c) => {
  return c.json({ data: 'Premium content' })
})
```

### Client Usage

```typescript
import { x402Fetch } from 'x402-mantle-sdk/client'

// Automatically handles 402 responses with payment modal
const response = await x402Fetch('https://api.example.com/api/premium')
const data = await response.json()
```

### Environment Variables

```bash
X402_APP_ID=your-app-id-here
```

## Agent Kit SDK

### Supported Protocols

**DEX Aggregators**
- OKX DEX - Multi-source liquidity aggregation
- OpenOcean - Cross-DEX aggregation

**Native DEXs**
- Agni Finance - Uniswap V3 architecture
- Merchant Moe - TraderJoe V2.1 architecture
- Uniswap V3 - Direct integration

**Lending**
- Lendle - Aave V2 architecture

**Cross-Chain**
- Squid Router - Axelar network integration

**Perpetual Trading**
- PikePerps - Leveraged trading on meme tokens (1-100x)

**Price Oracles**
- Pyth Network - 80+ real-time price feeds (crypto, forex, commodities, equities)

**Token & NFT Creation**
- Token Launchpad - Deploy ERC20 tokens and RWA (Real World Asset) tokens
- NFT Launchpad - Deploy ERC721 collections with minting

### DEX Operations

```typescript
// Agni Finance swap
const txHash = await agent.agniSwap(
  "0xTokenIn",
  "0xTokenOut",
  "1000000000000000000", // 1 token in wei
  0.5, // slippage %
  3000 // fee tier
)

// OpenOcean aggregator
const txHash = await agent.swapOnOpenOcean(fromToken, toToken, amount, 0.5)
```

### Lending Operations

```typescript
// Supply assets to earn yield
await agent.lendleSupply(tokenAddress, amount)

// Borrow against collateral
await agent.lendleBorrow(tokenAddress, amount, 2) // 2 = variable rate

// Repay debt
await agent.lendleRepay(tokenAddress, amount)

// Withdraw
await agent.lendleWithdraw(tokenAddress, amount)
```

### Cross-Chain Operations

```typescript
// Get route
const route = await agent.getSquidRoute(
  fromToken, toToken,
  181, // Mantle LayerZero ID
  1,   // Ethereum LayerZero ID
  amount
)

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  fromToken, toToken,
  181, 1, // from Mantle to Ethereum
  amount, 1 // 1% slippage
)
```

### Pyth Price Oracles

```typescript
// Get price by pair name
const ethPrice = await agent.pythGetPrice("ETH/USD")
console.log(ethPrice.formattedPrice) // "3450.00"

// Get price by token address
const price = await agent.pythGetTokenPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2")
// Returns: { tokenSymbol: "USDC", priceUsd: "1.00", lastUpdated: "2024-01-08T12:00:00.000Z" }

// Get multiple prices
const prices = await agent.pythGetMultiplePrices(["BTC/USD", "ETH/USD", "MNT/USD"])

// Get supported token addresses
const tokens = agent.pythGetSupportedTokenAddresses()
```

### Token Launchpad

```typescript
// Deploy standard ERC20 token (supply minted to your address)
const token = await agent.deployStandardToken("My Token", "MTK", "1000000")
console.log(token.tokenAddress)

// Deploy RWA (Real World Asset) token
const rwa = await agent.deployRWAToken(
  "Manhattan Property",
  "MPT",
  "10000",
  "Real Estate",
  "PROP-001"
)
```

### NFT Launchpad

```typescript
// Deploy ERC721 collection
const collection = await agent.deployNFTCollection({
  name: "My Collection",
  symbol: "MYC",
  baseURI: "https://api.example.com/metadata/",
  maxSupply: 10000
})

// Mint NFT
const nft = await agent.mintNFT(collection.collectionAddress)
console.log(nft.tokenId)

// Batch mint
await agent.batchMintNFT(collectionAddress, recipientAddress, 10)
```

### Perpetual Trading (PikePerps)

```typescript
// Open long position with 10x leverage
const position = await agent.pikeperpsOpenLong(tokenAddress, margin, 10)

// Open short position
const short = await agent.pikeperpsOpenShort(tokenAddress, margin, 5)

// Get positions
const positions = await agent.pikeperpsGetPositions()

// Close position
await agent.pikeperpsClosePosition(positionId)
```

### Environment Variables

```bash
# Required
APP_ID=your_app_id_here

# OKX DEX (optional)
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
```

## Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mantle Mainnet | 5000 | https://rpc.mantle.xyz | https://explorer.mantle.xyz |
| Mantle Sepolia | 5003 | https://rpc.sepolia.mantle.xyz | https://explorer.sepolia.mantle.xyz |

## Protocol Support: Testnet vs Mainnet

### Supported on Both Testnet & Mainnet

| Protocol | Testnet | Mainnet | Description |
|----------|:-------:|:-------:|-------------|
| Native MNT Transfers | ✅ | ✅ | Send/receive MNT tokens |
| OKX DEX Aggregator | ✅ | ✅ | DEX aggregation (requires API keys) |
| Squid Router | ✅ | ✅ | Cross-chain swaps & bridging |
| OpenOcean | ✅ | ✅ | DEX aggregation |
| x402 Payments | ✅ | ✅ | HTTP 402 payment infrastructure |

### Mainnet Only (Not Deployed on Testnet)

| Protocol | Testnet | Mainnet | Description |
|----------|:-------:|:-------:|-------------|
| Lendle | ❌ | ✅ | Lending/borrowing (Aave V2 fork) |
| Agni Finance | ❌ | ✅ | DEX (Uniswap V3 fork) |
| Merchant Moe | ❌ | ✅ | Liquidity Book DEX (TraderJoe V2.1) |
| mETH Protocol | ❌ | ✅ | Liquid staking |
| Uniswap V3 | ❌ | ✅ | DEX |
| Pyth Network | ✅ | ✅ | Price oracles (80+ assets) |
| PikePerps | ❌ | ✅ | Perpetual trading |
| Token Launchpad | ✅ | ✅ | ERC20 & RWA token deployment |
| NFT Launchpad | ✅ | ✅ | ERC721 collection deployment |

## Contract Addresses (Mainnet)

**Lendle Protocol**
- LendingPool: `0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3`

**Agni Finance**
- SwapRouter: `0x319B69888b0d11cEC22caA5034e25FfFBDc88421`

**Merchant Moe**
- LBRouter: `0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a`

**Uniswap V3**
- SwapRouter: `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45`

**mETH Protocol**
- mETH Token: `0xcDA86A272531e8640cD7F1a92c01839911B90bb0`

**Pyth Network**
- Pyth Oracle: `0xA2aa501b19aff244D90cc15a4Cf739D2725B5729`

**PikePerps**
- Trading Contract: `0x6b9bb36519538e0C073894E964E90172E1c0B41F`

## Project Structure

```
mantle-devkit/
├── packages/
│   ├── x402-devkit/              # x402 API monetization SDK (x402-mantle-sdk)
│   ├── mantle-agent-kit/         # DeFi protocol integrations (mantle-agent-kit-sdk)
│   ├── create-mantle-devkit-app/ # CLI scaffolding tool
│   └── mantle-devkit-mcp/        # MCP server for Claude AI integration
├── sdk-fe/                       # Dashboard & documentation frontend
└── README.md
```

## Development

```bash
# Install dependencies
bun install

# Build packages
bun run build

# Type check
bun run typecheck

# Development mode
bun run dev
```

## Token Addresses

### Mainnet (Chain ID: 5000)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| USDT | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | 18 |
| WETH | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | 18 |

### Testnet - Sepolia (Chain ID: 5003)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | 6 |
| WMNT | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | 18 |

## License

MIT

## Links

### NPM Packages
- [x402-mantle-sdk](https://www.npmjs.com/package/x402-mantle-sdk) - HTTP 402 payment SDK
- [mantle-agent-kit-sdk](https://www.npmjs.com/package/mantle-agent-kit-sdk) - DeFi protocol integrations
- [create-mantle-devkit-app](https://www.npmjs.com/package/create-mantle-devkit-app) - CLI scaffolding tool

### Resources
- [Dashboard](https://mantle-devkit.vercel.app) - Project dashboard & documentation
- [Documentation](https://mantle-devkit.vercel.app/docs-demo) - Full documentation
- [Mantle Explorer](https://explorer.mantle.xyz) - Mainnet block explorer
- [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz) - Testnet block explorer
- [Mantlescan](https://mantlescan.xyz) - Alternative block explorer
