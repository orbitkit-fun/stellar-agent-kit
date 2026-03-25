# Stellar Agent Kit

[![npm version](https://img.shields.io/npm/v/stellar-agent-kit.svg)](https://www.npmjs.com/package/stellar-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**The developer suite for building on Stellar.** A unified TypeScript SDK, CLI agent with DeFi tools, MCP server for Cursor and Claude, and HTTP 402 payment-gated APIs—so you can ship swaps, payments, lending, and oracles without wiring every protocol yourself.

---

## Features

- **Unified SDK** — Payments, path payments, DEX quotes & swaps (SoroSwap), lending (Blend), oracles (Reflector). One API for Stellar and Soroban.
- **CLI agent** — Interactive agent with tools: check balance, get swap quote, execute swap, create trustline, send payment. Uses Groq by default; plug in your key and go.
- **MCP server** — Stellar contract IDs, SDK snippets, and live quotes inside Cursor and Claude.
- **x402 payments** — Monetize APIs with Stellar. Server middleware (Next.js, Hono, Express) and client `x402Fetch` with `payWithStellar`.
- **Scaffolder** — `create-stellar-devkit-app` to generate an Agent Kit (Next.js) or x402 API app in one command.
- **Reference UI** — Next.js app with Swap, Send, Balance, DevKit overview, and docs (in this repo).

---

## Installation

### Use the SDK in your project

```bash
npm install stellar-agent-kit
```

Optional, for DEX swaps: [SoroSwap API key](https://soroswap.com) (or use contract simulation). For the CLI agent: `GROQ_API_KEY`, or `OPENAI_API_KEY`, or pass `--api-key`.

### Develop from this repository

Clone the repo and build from the **repository root** so workspace packages resolve:

```bash
git clone https://github.com/your-org/stellar-agent-kit.git
cd stellar-agent-kit
npm install
npm run build
```

---

## Quick start

```ts
import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY, "mainnet");
await agent.initialize();

// Get a swap quote (10 XLM → USDC)
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);
```

Or use the **CLI**: balance, pay, and an interactive **agent** that answers in natural language and calls tools (e.g. “What’s the balance of G…?” or “Get a quote to swap 10 XLM to USDC”).

---

## Packages

| Package | Description |
|--------|-------------|
| [**stellar-agent-kit**](https://www.npmjs.com/package/stellar-agent-kit) | Unified SDK: payments, DEX, lending, oracles, network config, assets. |
| [**x402-stellar-sdk**](https://www.npmjs.com/package/x402-stellar-sdk) | HTTP 402 middleware and `x402Fetch` — monetize APIs with Stellar. |
| [**create-stellar-devkit-app**](https://www.npmjs.com/package/create-stellar-devkit-app) | Scaffold Agent Kit or x402 API apps. Copy `.env` and run. |
| [**stellar-devkit-mcp**](https://www.npmjs.com/package/stellar-devkit-mcp) | MCP server for Cursor/Claude: contract IDs, SDK snippets, live quotes. |

---

## CLI

Run from the repo root after `npm run build` (or use the published `stellar-agent-kit` CLI if exposed):

| Command | Example |
|--------|--------|
| **Balance** | `node dist/index.js balance GABC... [--network=mainnet]` |
| **Pay** | `node dist/index.js pay S... G... 10 [--network=mainnet]` |
| **Agent** | `node dist/index.js agent` (uses `GROQ_API_KEY`, then `OPENAI_API_KEY`, or `--api-key`) |

Balance output: JSON array of `{ code, issuer, balance }`. Agent: interactive loop; try “What’s the balance of G…” or “Get a quote to swap 10 XLM to USDC”. Type `exit` to quit.

---

## Documentation

- **[FLOWCHART.md](FLOWCHART.md)** — Architecture, tool flows, and progress.
- **[docs/REFERENCE_MANTLE_DEVKIT.md](docs/REFERENCE_MANTLE_DEVKIT.md)** — Package layout and API alignment.
- **In-app docs** — Run the reference UI (`npm run dev:ui`) and open `/docs` for the full guide (quick start, SDK, x402, MCP, CLI, scaffolding).

---

## Requirements

- **Node.js** ≥ 18  
- **Agent CLI:** `GROQ_API_KEY`, or `OPENAI_API_KEY`, or `--api-key`  
- **DEX (optional):** SoroSwap API key for aggregator; otherwise simulation is used where supported  

---

## Contributing

Contributions are welcome. Open an issue or a pull request; for larger changes, discuss in an issue first.

---

## License

[MIT](LICENSE)
