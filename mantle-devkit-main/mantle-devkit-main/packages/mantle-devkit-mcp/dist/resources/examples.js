/**
 * Code Examples Resources
 */
export const CODE_EXAMPLES = {
    "example://swap": {
        description: "Token swap examples using various DEXs",
        content: `# Token Swap Examples

## Using Agni Finance

\`\`\`typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");
await agent.initialize();

// Swap MNT for USDC
const WMNT = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8";
const USDC = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";

const txHash = await agent.agniSwap(
  WMNT,
  USDC,
  "1000000000000000000", // 1 MNT
  0.5,   // 0.5% slippage
  3000   // 0.3% fee tier
);

console.log("Swap tx:", txHash);
\`\`\`

## Using 1inch Aggregator

\`\`\`typescript
// Get quote first
const quote = await agent.get1inchQuote(WMNT, USDC, "1000000000000000000");
console.log("Expected output:", quote.toTokenAmount);

// Execute swap
const txHash = await agent.swapOn1inch(
  WMNT,
  USDC,
  "1000000000000000000",
  0.5 // slippage
);
\`\`\`

## Using OpenOcean

\`\`\`typescript
const quote = await agent.getOpenOceanQuote(WMNT, USDC, "1000000000000000000");
const txHash = await agent.swapOnOpenOcean(WMNT, USDC, "1000000000000000000", 0.5);
\`\`\`

## Using Merchant Moe

\`\`\`typescript
const txHash = await agent.merchantMoeSwap(
  WMNT,
  USDC,
  "1000000000000000000",
  0.5
);
\`\`\`
`,
    },
    "example://lending-supply": {
        description: "Lendle supply/deposit example",
        content: `# Lendle Supply Example

Deposit tokens into Lendle to earn yield.

\`\`\`typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");
await agent.initialize();

// Token addresses
const USDC = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";

// Supply 100 USDC to Lendle
const amount = "100000000"; // 100 USDC (6 decimals)

const txHash = await agent.lendleSupply(USDC, amount);
console.log("Supply tx:", txHash);

// The SDK automatically:
// 1. Approves USDC for Lendle LendingPool
// 2. Calls deposit() on the LendingPool contract
// 3. Waits for transaction confirmation
\`\`\`

## Check Supplied Balance

After supplying, you can check your position using Lendle's DataProvider contract.
`,
    },
    "example://lending-borrow": {
        description: "Lendle borrow example",
        content: `# Lendle Borrow Example

Borrow tokens against supplied collateral.

\`\`\`typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");
await agent.initialize();

// First, supply collateral (see supply example)

// Token addresses
const USDC = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";

// Borrow 50 USDC with variable rate
const amount = "50000000"; // 50 USDC (6 decimals)
const interestRateMode = 2; // 1 = stable, 2 = variable

const txHash = await agent.lendleBorrow(
  USDC,
  amount,
  interestRateMode
);
console.log("Borrow tx:", txHash);
\`\`\`

## Repay Borrowed Amount

\`\`\`typescript
const repayTxHash = await agent.lendleRepay(
  USDC,
  amount,
  2 // variable rate
);
console.log("Repay tx:", repayTxHash);
\`\`\`

## Withdraw Collateral

\`\`\`typescript
const withdrawTxHash = await agent.lendleWithdraw(
  USDC,
  amount
);
console.log("Withdraw tx:", withdrawTxHash);
\`\`\`
`,
    },
    "example://x402-server": {
        description: "x402 server-side implementation example",
        content: `# x402 Server Example

Create a paid API with x402 protocol.

\`\`\`typescript
import express from "express";
import {
  createPaymentMiddleware,
  createx402Handler
} from "x402-devkit/server";

const app = express();

// Configure payment handler
const x402Handler = createx402Handler({
  payTo: "0xYourPaymentAddress",
  tokenAddress: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", // USDC
  amount: "1000000", // 1 USDC per request
  network: "mainnet",
});

// Apply middleware to paid routes
app.use("/api/premium", createPaymentMiddleware(x402Handler));

// Free endpoint
app.get("/api/free/data", (req, res) => {
  res.json({ data: "Free content" });
});

// Paid endpoint - requires x402 payment
app.get("/api/premium/data", (req, res) => {
  res.json({
    data: "Premium content",
    paid: true,
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
\`\`\`

## Environment Variables

\`\`\`env
APP_ID=your_app_id
PLATFORM_URL=https://mantle-devkit.vercel.app
\`\`\`
`,
    },
    "example://x402-client": {
        description: "x402 client-side implementation example",
        content: `# x402 Client Example

Make paid requests to x402-enabled APIs.

\`\`\`typescript
import { createx402Client } from "x402-devkit/client";

// Create client
const client = createx402Client({
  privateKey: process.env.PRIVATE_KEY!,
  network: "mainnet",
});

async function fetchPremiumData() {
  try {
    // Make paid request
    const response = await client.paidFetch(
      "https://api.example.com/api/premium/data"
    );

    if (!response.ok) {
      throw new Error(\`Request failed: \${response.status}\`);
    }

    const data = await response.json();
    console.log("Premium data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchPremiumData();
\`\`\`

## With POST Request

\`\`\`typescript
const response = await client.paidFetch(
  "https://api.example.com/api/premium/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "Generate something",
    }),
  }
);
\`\`\`

## Approve Tokens First

\`\`\`typescript
// Before making payments, approve the token
const USDC = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";
await client.approveToken(USDC, "1000000000"); // Approve 1000 USDC
\`\`\`
`,
    },
    "example://cross-chain": {
        description: "Cross-chain swap example using Squid Router",
        content: `# Cross-Chain Swap Example

Execute cross-chain swaps via Squid Router and Axelar.

\`\`\`typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

const agent = new MNTAgentKit(process.env.PRIVATE_KEY!, "mainnet");
await agent.initialize();

// Token addresses
const USDC_MANTLE = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";
const USDC_ARBITRUM = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// LayerZero Chain IDs
const MANTLE_LZ_ID = 181;
const ARBITRUM_LZ_ID = 110;

// Get route first
const route = await agent.getSquidRoute(
  USDC_MANTLE,
  USDC_ARBITRUM,
  MANTLE_LZ_ID,
  ARBITRUM_LZ_ID,
  "100000000", // 100 USDC
  1 // 1% slippage
);

console.log("Estimated output:", route.estimate.toAmount);
console.log("Estimated time:", route.estimate.estimatedTime);

// Execute cross-chain swap
const txHash = await agent.crossChainSwapViaSquid(
  USDC_MANTLE,
  USDC_ARBITRUM,
  MANTLE_LZ_ID,
  ARBITRUM_LZ_ID,
  "100000000",
  1
);

console.log("Cross-chain swap initiated:", txHash);
// Monitor on Axelar scan for completion
\`\`\`

## LayerZero Chain IDs Reference

| Chain | LayerZero ID |
|-------|-------------|
| Mantle | 181 |
| Ethereum | 101 |
| Arbitrum | 110 |
| Optimism | 111 |
| Polygon | 109 |
| BSC | 102 |
| Avalanche | 106 |
`,
    },
    "example://full-agent": {
        description: "Complete agent setup example",
        content: `# Complete Agent Setup

Full example of initializing and using the Mantle Agent Kit.

\`\`\`typescript
import { MNTAgentKit } from "mantle-agent-kit-sdk";

async function main() {
  // 1. Initialize agent
  const agent = new MNTAgentKit(
    process.env.PRIVATE_KEY!,
    "mainnet"
  );

  // 2. Validate with platform (requires APP_ID in env)
  await agent.initialize();

  console.log("Agent initialized");
  console.log("Project:", agent.projectConfig?.name);
  console.log("Network:", agent.projectConfig?.network);

  // 3. Get wallet address
  const address = agent.client.account.address;
  console.log("Wallet:", address);

  // 4. Example operations

  // Send native MNT
  const sendTx = await agent.sendTransaction(
    "0xRecipient",
    "1000000000000000000" // 1 MNT
  );

  // Swap on Agni
  const swapTx = await agent.agniSwap(
    "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", // WMNT
    "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", // USDC
    "1000000000000000000",
    0.5
  );

  // Supply to Lendle
  const supplyTx = await agent.lendleSupply(
    "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", // USDC
    "100000000" // 100 USDC
  );

  console.log("All operations complete!");
}

main().catch(console.error);
\`\`\`

## Environment Setup

Create a \`.env\` file:

\`\`\`env
PRIVATE_KEY=0x...
APP_ID=your_app_id

# Optional for OKX DEX
OKX_API_KEY=...
OKX_SECRET_KEY=...
OKX_API_PASSPHRASE=...
OKX_PROJECT_ID=...

# Optional for 1inch
ONEINCH_API_KEY=...
\`\`\`
`,
    },
};
//# sourceMappingURL=examples.js.map