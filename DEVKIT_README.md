# Stellar DevKit

Developer suite for Stellar: payment-gated APIs (x402), unified DeFi Agent Kit, CLI scaffolder, and MCP for LLMs.

## Overview

Stellar DevKit mirrors the [Mantle DevKit](https://github.com/Debanjannnn/mantle-devkit) package layout and API style, adapted for Stellar (Horizon, Soroban, asset code + issuer instead of ERC20 addresses).

### What's Included

| Package | Description |
|---------|-------------|
| **stellar-agent-kit** | Unified TypeScript SDK – `StellarAgentKit` with DEX (swap/quote), config, and pluggable protocols |
| **x402-stellar-sdk** | HTTP 402 Payment Required with Stellar payments – server middleware and `x402Fetch` client |
| **create-stellar-devkit-app** | CLI to scaffold Agent Kit or x402 API apps |
| **stellar-devkit-mcp** | MCP server for LLM tools (contract addresses, SDK snippets) |
| **sdk-fe** | Optional dashboard/docs; main docs in repo |

## Package Summary

| Package | Install / Use |
|---------|----------------|
| stellar-agent-kit | `npm i stellar-agent-kit` |
| x402-stellar-sdk | `npm i x402-stellar-sdk` |
| create-stellar-devkit-app | `npx create-stellar-devkit-app my-app` |
| stellar-devkit-mcp | See MCP docs |

## Quick Start

### Agent Kit – DeFi (swap, quote)

```bash
npm install stellar-agent-kit
```

```typescript
import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "testnet");
await agent.initialize();

// Quote then swap
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000" // raw units (7 decimals)
);
const result = await agent.dexSwap(quote);
console.log(result.hash);
```

### x402 – API monetization with Stellar

```bash
npm install x402-stellar-sdk
```

**Server – protect a route**

```typescript
import { x402 } from "x402-stellar-sdk/server";
import express from "express";

const app = express();
app.use(
  "/api/premium",
  x402({
    price: "1",
    assetCode: "XLM",
    network: "testnet",
    destination: "G...", // your receiving account
    memo: "premium-api",
  })
);
app.get("/api/premium", (_, res) => res.json({ data: "Premium content" }));
```

**Client – pay then fetch**

```typescript
import { x402Fetch } from "x402-stellar-sdk/client";

const res = await x402Fetch("https://api.example.com/api/premium", undefined, {
  payWithStellar: async (req) => {
    // Use Freighter or another wallet to send payment to req.destination
    // with req.amount, req.assetCode, req.issuer, req.memo
    return { transactionHash: "..." };
  },
});
const data = await res.json();
```

## StellarAgentKit – protocols

- **DEX** – `dexGetQuote`, `dexSwap`, `dexSwapExactIn` (wire SoroSwap or another aggregator in `dex/`).
- **Config** – `getNetworkConfig`, `TESTNET_ASSETS`, `MAINNET_ASSETS`, `SOROSWAP_AGGREGATOR` in `config/`.
- **Pluggable** – add `lending/`, `oracle/`, `cross-chain/` and expose as `agent.lendingSupply()`, `agent.getPrice()`, etc.

## Networks and contract addresses

| Network | Horizon | Soroban RPC |
|---------|---------|-------------|
| testnet | https://horizon-testnet.stellar.org | https://soroban-testnet.stellar.org |
| mainnet | https://horizon.stellar.org | https://soroban-rpc.mainnet.stellar.gateway.fm |

**SoroSwap aggregator:** testnet `CCJUD55AG6W5...`, mainnet `CAG5LRYQ5JVE...`.

**Assets:** Stellar uses asset code + issuer (e.g. USDC `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`) or Soroban contract ID (e.g. wrapped XLM).

## CLI scaffolder

```bash
npx create-stellar-devkit-app my-app
```

Choose **Agent Kit** (swap UI + StellarAgentKit) or **x402 API** (payment-gated API). Then:

- `cd my-app && cp .env.example .env`
- Set `SECRET_KEY` / `SOROSWAP_API_KEY` or `X402_DESTINATION`
- `npm run dev`

## Monorepo scripts

From repo root:

- `npm run build` – build root (existing CLI) and all workspace packages
- `npm run build:agent-kit` – build only stellar-agent-kit
- `npm run build:x402` – build only x402-stellar-sdk
- `npm run typecheck` – typecheck root and workspaces

## Implementation notes

- TypeScript throughout; Stellar semantics (asset code/issuer, Horizon, Soroban) not EVM.
- Design for pluggability: new DEX or oracle = new module + wire into `StellarAgentKit`.
- x402 server returns 402 with headers `X-402-Amount`, `X-402-Asset-Code`, `X-402-Destination`, `X-402-Network`, `X-402-Issuer` (optional), `X-402-Memo` (optional). Client pays then retries with `X-402-Transaction-Hash`.
- **stellar-agent-kit** DEX is wired to SoroSwap (quote + build + sign + submit). Set `SOROSWAP_API_KEY` for execute.
- **x402-stellar-sdk** verifies payment on Horizon (transaction hash → fetch tx + operations, check destination/amount/asset/memo).
- **Adapters**: `x402-stellar-sdk/server/hono` exports `x402Hono(options)`. `x402-stellar-sdk/server/next` exports `withX402(headers, options)` for App Router (returns `Response | null`).
- **sdk-fe**: run `npm run dev` in `sdk-fe` for docs dashboard (packages, networks, code snippets).
