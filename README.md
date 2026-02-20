# Stellar Agentic Kit

Stellar agentic devkit: unified SDK (swap, quote, send), AI agent CLI with tools, MCP server, x402 payments, and reference UI. All packages are published on npm: `stellar-agent-kit`, `x402-stellar-sdk`, `create-stellar-devkit-app`, `stellar-devkit-mcp`.

Architecture: see [FLOWCHART.md](FLOWCHART.md) and [docs/REFERENCE_MANTLE_DEVKIT.md](docs/REFERENCE_MANTLE_DEVKIT.md) for how packages fit together.

## Setup (from this repo)

```bash
npm install
npm run build
```

Or use the published SDK in your own project: `npm install stellar-agent-kit` (see [GETTING_STARTED.md](GETTING_STARTED.md)).

## CLI

### Balance

Get balances for a Stellar address (XLM + trust lines):

```bash
# Testnet (default)
npm run balance -- GABC... --network=mainnet

# Or after build
node dist/index.js balance GABC... --network=mainnet

# Mainnet
node dist/index.js balance GABC... --network=mainnet
```

Output is JSON array of `{ code, issuer, balance }`.

### Agent (chat with DeFi agent)

Interactive loop: ask for balance checks or swap quotes; the agent calls tools and replies.

```bash
# Set GROQ_API_KEY (or pass --api-key), then:
npm run build
node dist/index.js agent
# or: node dist/index.js agent --api-key <your-groq-key>
```

At the prompt try: "What's the balance of G..." or "Get a quote to swap 10 XLM to USDC". Type `exit` to quit.

### Pay

Send XLM or a custom asset:

```bash
# XLM payment
node dist/index.js pay S... G... 10 --network=mainnet

# Custom asset
node dist/index.js pay S... G... 100 --network=mainnet --asset=USDC --issuer=G...
```

## Programmatic use

```ts
import { getNetworkConfig } from "./config/networks.js";
import { StellarClient } from "./core/stellarClient.js";

const config = getNetworkConfig("mainnet");
const client = new StellarClient(config);

const balances = await client.getBalance("G...");
const result = await client.sendPayment("S...", "G...", "10");
```

## Project layout

- `src/config/networks.ts` – mainnet config (Horizon, Soroban RPC)
- `src/core/stellarClient.ts` – `StellarClient`: `getBalance()`, `sendPayment()`
- `src/index.ts` – CLI (Commander)

## Requirements

- Node 18+
- Zod (validation), Commander (CLI), @stellar/stellar-sdk, openai (for `agent` command)
- For agent: set `GROQ_API_KEY` or pass `--api-key` (CLI uses Groq by default)

## License

MIT
