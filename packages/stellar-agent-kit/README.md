# stellar-agent-kit

Unified TypeScript SDK for Stellar: payments, DEX (SoroSwap), lending (Blend), and oracles. AgentKit-style API: one class, `initialize()`, then protocol methods.

## Install

```bash
npm install stellar-agent-kit
```

## Quick start

```typescript
import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Balances
const balances = await agent.getBalances();

// Send XLM
await agent.sendPayment("G...", "10");

// DEX quote + swap
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000" // 1 XLM (7 decimals)
);
await agent.dexSwap(quote);

// Path payment (strict receive)
await agent.pathPayment(
  { assetCode: "XLM" },
  "10",
  "G...",
  { assetCode: "USDC", issuer: "G..." },
  "5",
  []
);

// Create account
await agent.createAccount("G...", "1");

// Price (Reflector oracle)
const price = await agent.getPrice({ symbol: "XLM" });
```

## API overview

| Method | Description |
|--------|-------------|
| `initialize()` | Must be called once after construction. Sets up Horizon, DEX, oracle. |
| `getBalances(accountId?)` | Native + trustline balances for an account (default: this key). |
| `sendPayment(to, amount, assetCode?, assetIssuer?)` | Send a payment (XLM or custom asset). |
| `createAccount(destination, startingBalance)` | Create a new account (funded from this key). |
| `pathPayment(sendAsset, sendMax, destination, destAsset, destAmount, path?)` | Path payment strict receive. |
| `dexGetQuote(from, to, amount)` | Get swap quote (SoroSwap aggregator). |
| `dexSwap(quote)` | Execute a swap from a quote. |
| `dexSwapExactIn(from, to, amount)` | Get quote and execute in one call. |
| `getPrice(asset)` | Latest price from Reflector oracle. |
| `lendingSupply(args)` | Supply to a Blend pool. |
| `lendingBorrow(args)` | Borrow from a Blend pool. |

## Network

Currently **mainnet only**. Set `SECRET_KEY` and optionally `SOROSWAP_API_KEY` (for DEX quotes) in your environment.

## Exports

- `StellarAgentKit`, `StellarNetwork`
- `getNetworkConfig`, `networks`, `MAINNET_ASSETS`, `SOROSWAP_AGGREGATOR`
- `createDexClient`, `createReflectorOracle`, `lendingSupply`, `lendingBorrow`
- Types: `DexAsset`, `QuoteResult`, `SwapResult`, `OracleAsset`, `PriceData`, `LendingSupplyArgs`, etc.
