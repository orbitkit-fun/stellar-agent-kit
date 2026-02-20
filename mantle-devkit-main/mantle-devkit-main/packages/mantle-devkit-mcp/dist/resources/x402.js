/**
 * x402 SDK Documentation Resources
 */
export const X402_RESOURCES = {
    "mantle://x402/overview": {
        description: "Overview of the x402 protocol and SDK",
        content: `# x402 Protocol

x402 enables HTTP 402 (Payment Required) payments on Mantle Network. It allows developers to monetize APIs and services with crypto payments.

## What is x402?

x402 is a payment protocol that:
- Uses HTTP 402 status code for payment flows
- Supports both server-side and client-side integration
- Works with ERC20 tokens on Mantle
- Provides automatic payment verification

## SDK Installation

\`\`\`bash
npm install x402-devkit
# or
bun install x402-devkit
\`\`\`

## Quick Start - Server

\`\`\`typescript
import { createPaymentMiddleware, createx402Handler } from "x402-devkit/server";
import express from "express";

const app = express();

// Create x402 handler
const x402Handler = createx402Handler({
  payTo: "0xYourPaymentAddress",
  tokenAddress: "0xTokenAddress", // USDC, USDT, etc.
  amount: "1000000", // Amount in token decimals
});

// Use as middleware
app.use("/api/paid", createPaymentMiddleware(x402Handler));

app.get("/api/paid/data", (req, res) => {
  res.json({ data: "Premium content" });
});
\`\`\`

## Quick Start - Client

\`\`\`typescript
import { createx402Client } from "x402-devkit/client";

const client = createx402Client({
  privateKey: "0xYourPrivateKey",
  network: "mainnet",
});

// Make paid request
const response = await client.paidFetch("https://api.example.com/paid/data");
const data = await response.json();
\`\`\`
`,
    },
    "mantle://x402/server": {
        description: "x402 server-side integration guide",
        content: `# x402 Server Integration

## Express Middleware

\`\`\`typescript
import {
  createPaymentMiddleware,
  createx402Handler,
  type x402Config
} from "x402-devkit/server";
import express from "express";

const app = express();

// Configure x402 handler
const config: x402Config = {
  payTo: "0xYourPaymentAddress",
  tokenAddress: "0x...", // Token to accept
  amount: "1000000",     // Amount per request
  network: "mainnet",    // or "testnet"
};

const x402Handler = createx402Handler(config);

// Apply to routes requiring payment
app.use("/api/premium", createPaymentMiddleware(x402Handler));

// Protected endpoints
app.get("/api/premium/data", (req, res) => {
  res.json({ premium: true });
});
\`\`\`

## Platform Validation

The server validates requests against the Mantle DevKit platform:

\`\`\`typescript
// Validate APP_ID
const config = await validateAppId(appId);
// Returns: { appId, name, payTo, network, status }
\`\`\`

## Custom Validation

\`\`\`typescript
const handler = createx402Handler({
  payTo: "0x...",
  tokenAddress: "0x...",
  amount: "1000000",
  validatePayment: async (payment) => {
    // Custom validation logic
    return { valid: true };
  },
});
\`\`\`

## Supported Tokens

Configure any ERC20 token on Mantle:
- USDC: \`0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9\`
- USDT: \`0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE\`
- WMNT: \`0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8\`

Or use native MNT with address \`0x0000000000000000000000000000000000000000\`.
`,
    },
    "mantle://x402/client": {
        description: "x402 client-side integration guide",
        content: `# x402 Client Integration

## Setup

\`\`\`typescript
import { createx402Client } from "x402-devkit/client";

const client = createx402Client({
  privateKey: process.env.PRIVATE_KEY,
  network: "mainnet", // or "testnet"
});
\`\`\`

## Making Paid Requests

\`\`\`typescript
// Simple fetch
const response = await client.paidFetch("https://api.example.com/paid/resource");

// With options
const response = await client.paidFetch("https://api.example.com/paid/resource", {
  method: "POST",
  body: JSON.stringify({ data: "value" }),
  headers: {
    "Content-Type": "application/json",
  },
});
\`\`\`

## Payment Flow

1. Client makes request to protected endpoint
2. Server returns HTTP 402 with payment requirements
3. Client automatically creates and signs payment
4. Client retries request with payment proof in header
5. Server verifies payment and returns response

## Error Handling

\`\`\`typescript
try {
  const response = await client.paidFetch(url);
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  const data = await response.json();
} catch (error) {
  if (error.code === "INSUFFICIENT_BALANCE") {
    console.log("Not enough tokens for payment");
  }
  throw error;
}
\`\`\`

## Token Approval

Before making payments, ensure the x402 contract is approved to spend tokens:

\`\`\`typescript
await client.approveToken(tokenAddress, amount);
\`\`\`
`,
    },
    "mantle://x402/payment-flow": {
        description: "Detailed x402 payment flow explanation",
        content: `# x402 Payment Flow

## Overview

The x402 protocol implements the HTTP 402 (Payment Required) status code for crypto payments.

## Flow Diagram

\`\`\`
Client                    Server                    Blockchain
  |                         |                          |
  |--- GET /paid/data ----->|                          |
  |                         |                          |
  |<-- 402 Payment Required-|                          |
  |    {payTo, amount, token}                          |
  |                         |                          |
  |--- Create Payment ------|------------------------->|
  |    (sign transaction)   |                          |
  |                         |                          |
  |--- GET /paid/data ----->|                          |
  |    X-Payment: proof     |                          |
  |                         |--- Verify Payment ------>|
  |                         |<-- Confirmed ------------|
  |                         |                          |
  |<-- 200 OK --------------|                          |
  |    {data}               |                          |
\`\`\`

## 402 Response Format

\`\`\`json
{
  "status": 402,
  "message": "Payment Required",
  "payment": {
    "payTo": "0x...",
    "tokenAddress": "0x...",
    "amount": "1000000",
    "network": "mantle",
    "chainId": 5000
  }
}
\`\`\`

## Payment Header

After payment, client sends:

\`\`\`
X-Payment: <base64-encoded-payment-proof>
\`\`\`

## Verification

Server verifies:
1. Payment signature is valid
2. Payment amount matches requirement
3. Payment is to correct address
4. Payment hasn't been used before (replay protection)
`,
    },
};
//# sourceMappingURL=x402.js.map