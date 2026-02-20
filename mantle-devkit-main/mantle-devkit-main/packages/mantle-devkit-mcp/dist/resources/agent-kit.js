/**
 * Agent Kit SDK Documentation Resources
 */
export const AGENT_KIT_RESOURCES = {
    "mantle://agent-kit/overview": {
        description: "Overview of the Mantle Agent Kit SDK",
        content: `# Mantle Agent Kit SDK

TypeScript SDK for seamless integration with DeFi protocols on Mantle Network. Provides unified interfaces for swaps, lending, liquid staking, and cross-chain operations.

## Installation

\`\`\`bash
npm install mantle-agent-kit-sdk
# or
bun install mantle-agent-kit-sdk
\`\`\`

## Quick Start

\`\`\`typescript
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
\`\`\`

## Supported Protocols

### DEX Aggregators
- OKX DEX Aggregator - Multi-source liquidity aggregation
- 1inch - Pathfinder algorithm for optimal routes
- OpenOcean - Cross-DEX aggregation

### Native Mantle DEXs
- Agni Finance - Concentrated liquidity (Uniswap V3 architecture)
- Merchant Moe - Liquidity Book DEX (TraderJoe V2.1 architecture)
- Uniswap V3 - Direct integration

### Lending
- Lendle - Primary lending market (Aave V2 architecture)

### Liquid Staking
- mETH Protocol - Mantle's native liquid staking derivative

### Cross-Chain
- Squid Router - Cross-chain swaps via Axelar network
`,
    },
    "mantle://agent-kit/dex": {
        description: "DEX operations and swap functions",
        content: `# DEX Operations

## OKX DEX Aggregator

\`\`\`typescript
// Get optimal swap quote
const quote = await agent.getSwapQuote(
  fromTokenAddress,
  toTokenAddress,
  amount,
  slippagePercentage // default: "0.5"
);

// Execute swap
const txHash = await agent.executeSwap(
  fromTokenAddress,
  toTokenAddress,
  amount,
  slippagePercentage // default: "0.5"
);
\`\`\`

**Environment Variables Required:**
\`\`\`env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
\`\`\`

## 1inch

\`\`\`typescript
const quote = await agent.get1inchQuote(fromToken, toToken, amount);
const txHash = await agent.swapOn1inch(fromToken, toToken, amount, slippage);
\`\`\`

## OpenOcean

\`\`\`typescript
const quote = await agent.getOpenOceanQuote(fromToken, toToken, amount);
const txHash = await agent.swapOnOpenOcean(fromToken, toToken, amount, slippage);
\`\`\`

## Uniswap V3

\`\`\`typescript
const quote = await agent.getUniswapQuote(fromToken, toToken, amount);
const txHash = await agent.swapOnUniswap(fromToken, toToken, amount, slippage);
\`\`\`

## Agni Finance

\`\`\`typescript
const txHash = await agent.agniSwap(
  tokenIn,
  tokenOut,
  amountIn,
  slippagePercent, // default: 0.5
  feeTier // optional: 500, 3000, 10000
);
\`\`\`

**Fee Tiers:**
- 500 = 0.05%
- 3000 = 0.3%
- 10000 = 1%

## Merchant Moe

\`\`\`typescript
const txHash = await agent.merchantMoeSwap(
  tokenIn,
  tokenOut,
  amountIn,
  slippagePercent // default: 0.5
);
\`\`\`
`,
    },
    "mantle://agent-kit/lending": {
        description: "Lendle lending protocol operations",
        content: `# Lendle Lending Protocol

Lendle is Mantle's primary lending market built on Aave V2 architecture.

## Contract Addresses (Mainnet)

- LendingPool: \`0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3\`
- DataProvider: \`0xD0E0b5e99c8a36f4c5234cd1E90CFc5C2Bb58A69\`

## Supply Assets

Deposit tokens to earn yield and use as collateral.

\`\`\`typescript
const txHash = await agent.lendleSupply(
  tokenAddress, // Address of token to supply
  amount        // Amount in wei as string
);
\`\`\`

## Withdraw Assets

Withdraw previously supplied tokens.

\`\`\`typescript
const txHash = await agent.lendleWithdraw(
  tokenAddress, // Address of token to withdraw
  amount,       // Amount in wei as string
  to            // Optional: recipient address
);
\`\`\`

## Borrow Assets

Borrow against supplied collateral.

\`\`\`typescript
const txHash = await agent.lendleBorrow(
  tokenAddress,     // Address of token to borrow
  amount,           // Amount in wei as string
  interestRateMode, // 1 = stable, 2 = variable (default)
  onBehalfOf        // Optional: address to borrow on behalf of
);
\`\`\`

## Repay Debt

Repay borrowed assets.

\`\`\`typescript
const txHash = await agent.lendleRepay(
  tokenAddress, // Address of token to repay
  amount,       // Amount in wei as string
  rateMode,     // 1 = stable, 2 = variable (default)
  onBehalfOf    // Optional: address to repay for
);
\`\`\`

## Implementation Notes

- Uses Aave V2 architecture
- Function names: \`deposit\` (not \`supply\`), \`withdraw\`, \`borrow\`, \`repay\`
- Interest rate modes: 1 = stable, 2 = variable
- \`referralCode\` parameter is always 0
`,
    },
    "mantle://agent-kit/cross-chain": {
        description: "Cross-chain operations via Squid Router",
        content: `# Cross-Chain Operations

## Squid Router

Execute cross-chain swaps via Axelar network.

### Get Cross-Chain Route

\`\`\`typescript
const route = await agent.getSquidRoute(
  fromToken,  // Source token address
  toToken,    // Destination token address
  fromChain,  // Source chain LayerZero ID
  toChain,    // Destination chain LayerZero ID
  amount,     // Amount in wei as string
  slippage    // default: 1
);
\`\`\`

### Execute Cross-Chain Swap

\`\`\`typescript
const txHash = await agent.crossChainSwapViaSquid(
  fromToken,
  toToken,
  fromChain,
  toChain,
  amount,
  slippage // default: 1
);
\`\`\`

## LayerZero Chain IDs

- Mantle Mainnet: 181
- Ethereum: 101
- Arbitrum: 110
- Optimism: 111
- Polygon: 109
- BSC: 102
- Avalanche: 106

**Note:** Uses LayerZero chain IDs, not EVM chain IDs.
`,
    },
    "mantle://agent-kit/meth": {
        description: "mETH liquid staking protocol",
        content: `# mETH Protocol

Mantle's native liquid staking derivative for Ethereum.

## Token Address

\`\`\`typescript
const methAddress = agent.getMethTokenAddress();
// Returns: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0 (mainnet)
\`\`\`

## What is mETH?

mETH is a liquid staking token that represents staked ETH on Mantle. When you stake ETH, you receive mETH in return which:

- Accrues staking rewards automatically
- Can be used in DeFi protocols
- Maintains liquidity (tradeable on DEXs)

## Staking ETH for mETH

To stake ETH for mETH, use the official mETH interface:
https://www.mantle-meth.xyz/

The SDK provides the token address for use in other operations (swaps, lending, etc.).
`,
    },
    "mantle://agent-kit/configuration": {
        description: "SDK configuration and environment setup",
        content: `# Configuration

## Platform Configuration (Required)

The Mantle Agent Kit requires an APP_ID for platform validation.

\`\`\`env
APP_ID=your_app_id_here

# Optional: Custom platform URL (defaults to https://mantle-devkit.vercel.app)
PLATFORM_URL=https://mantle-devkit.vercel.app
\`\`\`

### What is APP_ID?

APP_ID is a unique identifier that authenticates your application. When you call \`agent.initialize()\`, it validates your APP_ID with the platform API and returns your project configuration.

### Validation Flow

1. Create agent: \`new MNTAgentKit(privateKey, "mainnet")\`
2. Initialize: \`await agent.initialize()\`
3. API validates APP_ID
4. Returns project config (name, payTo, network, status)
5. Checks status is "ACTIVE"

## Protocol-Specific Variables

### OKX DEX (Required for OKX methods)

\`\`\`env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_API_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
\`\`\`

### 1inch (Optional - Higher rate limits)

\`\`\`env
ONEINCH_API_KEY=your_api_key
\`\`\`

## Network Configuration

\`\`\`typescript
// Mainnet (Chain ID 5000)
const mainnetAgent = new MNTAgentKit(privateKey, "mainnet");

// Testnet (Chain ID 5003 - Sepolia)
const testnetAgent = new MNTAgentKit(privateKey, "testnet");
\`\`\`
`,
    },
};
//# sourceMappingURL=agent-kit.js.map