# Stellar Agentic Kit — Feature Checklist

**Purpose:** Canonical list of features for the Stellar agentic devkit. Use this to confirm scope and to drive testing.

---

## 1. Unified SDK (`stellar-agent-kit`)

| # | Feature | Description |
|---|---------|-------------|
| 1.1 | **StellarAgentKit** | Constructor(secretKey, network). `initialize()` before use. |
| 1.2 | **DEX quote** | `dexGetQuote(fromAsset, toAsset, amount)` — SoroSwap aggregator (SoroSwap, Phoenix, Aqua). |
| 1.3 | **DEX swap** | `dexSwap(quote)` — build + sign + submit via SoroSwap API. |
| 1.4 | **DEX one-shot** | `dexSwapExactIn(from, to, amount)` — quote + swap in one call. |
| 1.5 | **Send payment** | `sendPayment(to, amount, assetCode?, assetIssuer?)` — Horizon payment (XLM or custom asset). |
| 1.6 | **Config** | `MAINNET_ASSETS`, `TESTNET_ASSETS`, `getNetworkConfig(network)`, `SOROSWAP_AGGREGATOR`. |
| 1.7 | **Pluggable DEX** | `createDexClient(config, apiKey)` — SoroSwap wired; design allows more DEXes. |
| 1.8 | **Oracle (Reflector)** | `getPrice(asset)` — SEP-40 lastprice; asset = `{ contractId }` or `{ symbol }`. `REFLECTOR_ORACLE`, `BAND_ORACLE`. |
| 1.9 | **Lending (Blend)** | `lendingSupply({ poolId, assetContractId, amount })`, `lendingBorrow(...)`. `BLEND_POOLS` for mainnet/testnet. |

**Not in SDK yet:** Cross-chain (e.g. Allbridge) and perps — no Stellar-native integration; can be added when available.

---

## 2. AI agent (CLI, root `src/`)

| # | Feature | Description |
|---|---------|-------------|
| 2.1 | **CLI balance** | `node dist/index.js balance <G...> [--network=testnet\|mainnet]` — XLM + trust lines. |
| 2.2 | **CLI pay** | `node dist/index.js pay <S...> <G...> <amount> [--network] [--asset] [--issuer]` — send XLM or custom asset. |
| 2.3 | **CLI agent** | `node dist/index.js agent [--api-key <key>]` — interactive chat; uses `GROQ_API_KEY` or `--api-key` (Groq). |
| 2.4 | **Tool: check_balance** | Get token balances for a Stellar address (network: testnet/mainnet). |
| 2.5 | **Tool: swap_asset** | Swap tokens; include `privateKey` to execute, omit for quote only. |
| 2.6 | **Tool: get_swap_quote** | Get swap quote without executing. |
| 2.7 | **Tool: create_trustline** | Create trustline (e.g. USDC) for an address. |
| 2.8 | **StellarClient** | `getBalance(address)`, `sendPayment(secretKey, destination, amount, ...)` in `src/core/stellarClient.ts`. |

**Stack:** OpenAI-compatible API (Groq in CLI), function-calling, tools in `src/tools/agentTools.ts`.

---

## 3. MCP server (`stellar-devkit-mcp`)

| # | Feature | Description |
|---|---------|-------------|
| 3.1 | **MCP server** | ListResources, ReadResource, ListTools, CallTool. |
| 3.2 | **Resources** | Stellar docs/content (e.g. `resources/stellar.ts`). |
| 3.3 | **Tool: get_stellar_contract** | Look up contract IDs (e.g. SoroSwap testnet/mainnet). |
| 3.4 | **Tool: get_sdk_snippet** | Get code snippets (swap, quote, x402-server, x402-client). |

Enables Claude (or other MCP clients) to look up contracts and snippets.

---

## 4. x402 payments (`x402-stellar-sdk`)

| # | Feature | Description |
|---|---------|-------------|
| 4.1 | **Server middleware** | Hono, Express-style, Next adapter — payment-gated routes. |
| 4.2 | **Verification** | Stellar payment verification (Horizon / tx hash). |
| 4.3 | **Client** | `x402Fetch` with pay-with-Stellar callback (e.g. Freighter). |

Monetized APIs with Stellar payments.

---

## 5. Scaffolder (`create-stellar-devkit-app`)

| # | Feature | Description |
|---|---------|-------------|
| 5.1 | **CLI** | `npx create-stellar-devkit-app <name>` — scaffold from templates. |
| 5.2 | **Template: agent-kit** | Minimal Next.js + `stellar-agent-kit` (quote route, starter UI). |
| 5.3 | **Template: x402-api** | Express + x402 payment-gated API. |

---

## 6. Warly UI (`ui/`)

| # | Feature | Description |
|---|---------|-------------|
| 6.1 | **Landing** | Hero, capabilities, CTA. |
| 6.2 | **Wallet** | Freighter connect, disconnect, copy address, explorer link. |
| 6.3 | **Swap** | Quote → build (API) → sign (Freighter) → submit; XLM ↔ USDC; SoroSwap/Phoenix/Aqua. |
| 6.4 | **Send** | Build payment XDR → sign → submit (XLM or USDC). |
| 6.5 | **DevKit page** | DevKit overview. |
| 6.6 | **Protocols page** | Soroswap, Phoenix, Aqua, SDEX, StellarX — descriptions + code examples. |
| 6.7 | **API routes** | `/api/swap/quote`, `/api/swap/build`, `/api/swap/submit`, `/api/send/build`, `/api/send/submit`, `/api/balance`. |

No secret key in the browser; execution via API + Freighter signing.

---

## 7. Publishing & consumption

| # | Feature | Description |
|---|---------|-------------|
| 7.1 | **npm packages** | `stellar-agent-kit`, `x402-stellar-sdk`, `create-stellar-devkit-app`, `stellar-devkit-mcp` published to npm. |
| 7.2 | **Install** | `npm install stellar-agent-kit` (and others) in any Node/TS project. |
| 7.3 | **Scaffold** | `npx create-stellar-devkit-app my-app` after publish. |

---

## Summary (agentic kit for Stellar)

- **SDK:** Quote, swap, send; config and SoroSwap aggregator; pluggable DEX design.
- **AI agent:** CLI with balance, pay, agent (chat); four tools: check_balance, swap_asset, get_swap_quote, create_trustline; Groq/OpenAI-compatible.
- **MCP:** Server with resources and tools for contracts + snippets.
- **x402:** Payment-gated APIs with Stellar; server + client.
- **Scaffolder:** Two templates (agent-kit, x402-api).
- **UI:** Swap, Send, Protocols, DevKit, wallet (Freighter); API routes for build/submit.
- **Publishing:** All four packages on npm; install and npx work.

Use this list to confirm behavior when testing.
