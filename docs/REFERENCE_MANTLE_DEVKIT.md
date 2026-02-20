# Stellar DevKit — Reference: Mantle DevKit

This document maps the **Mantle DevKit** (see `mantle-devkit-main/mantle-devkit-main` in this repo) to the **Stellar DevKit**. Use Mantle as the structural and API-pattern reference when adding features or polishing.

---

## Package mapping

| Mantle DevKit | Stellar DevKit | Notes |
|---------------|----------------|-------|
| `x402-mantle-sdk` | `x402-stellar-sdk` | HTTP 402 payment-gated APIs; server middleware + client |
| `mantle-agent-kit-sdk` | `stellar-agent-kit` | Unified AgentKit-style SDK (payments, DEX, lending, oracles) |
| `create-mantle-devkit-app` | `create-stellar-devkit-app` | CLI to scaffold x402 and Agent Kit projects |
| `mantle-devkit-mcp` | `stellar-devkit-mcp` | MCP server for AI/Claude integration |

---

## API patterns to mirror

### 1. x402 SDK (server)

**Mantle (Hono):**

```ts
import { x402 } from 'x402-mantle-sdk/server'
app.use('/api/premium', x402({ price: '0.001', token: 'MNT', testnet: true }))
```

**Stellar equivalent:**

- Use `x402Hono(options)` from `x402-stellar-sdk/server/hono` with Stellar options: `price`, `assetCode`, `issuer?`, `network`, `destination`, `memo?`.
- For Next.js: use `processPaymentMiddleware(paymentOptions, headers)` and return 402 with payment details (see Mantle fullstack template `src/app/api/premium/route.ts`).

### 2. x402 SDK (client)

**Mantle:** `x402Fetch('https://api.example.com/api/premium')` with automatic payment handling.

**Stellar:** `x402Fetch(url, init, { payWithStellar })` — client must provide `payWithStellar(paymentRequest)` that performs the Stellar payment and returns `{ transactionHash }`; then the client retries the request with the hash in headers.

### 3. Agent Kit SDK

**Mantle:** `MNTAgentKit(privateKey, "mainnet" | "testnet")` → `initialize()` → methods: `sendTransaction`, `agniSwap`, `getSwapQuote`, `executeSwap`, `lendleSupply`, etc.

**Stellar:** `StellarAgentKit(secretKey, "mainnet")` → `initialize()` → methods: `sendPayment`, `dexGetQuote`, `dexSwap`, `dexSwapExactIn`, `getPrice`, `lendingSupply`, `lendingBorrow`. Keep the same “constructor + initialize + protocol methods” shape.

### 4. Create-app CLI

**Mantle:** Commander; project types `x402-fullstack` | `x402-backend` | `agent-kit`; frameworks `hono` | `express`; templates: `agent-kit`, `backend-hono`, `backend-express`, `fullstack-hono`, `fullstack-express`.

**Stellar:** Mirror the flow: choose SDK (x402 vs agent-kit), then for x402 choose fullstack vs backend and framework. Templates: `agent-kit`, `x402-api` (with Hono/Express variants if desired).

### 5. MCP server

**Mantle:** Resources (agent-kit, x402, mantle, code examples); tools: `search_mantle_docs`, `get_contract_address`, `get_code_example`.

**Stellar:** Resources for stellar-agent-kit, x402-stellar-sdk, Stellar network; tools: e.g. `search_stellar_docs`, `get_stellar_contract`, `get_sdk_snippet` — keep in sync with real exports of `stellar-agent-kit` and `x402-stellar-sdk`.

---

## File layout reference (Mantle)

- **mantle-agent-kit:** `src/agent.ts` (main class), `src/tools/*`, `src/utils/*`, `src/constants/*`, `src/index.ts` (re-exports).
- **x402:** Server middleware in `server/`, client in `client/`; Next.js uses `processPaymentMiddleware` + manual 402 response.
- **create-mantle-devkit-app:** `src/index.ts` (Commander + prompts), `templates/{agent-kit, backend-hono, backend-express, fullstack-*}`.
- **mantle-devkit-mcp:** `dist/index.js` (MCP server), `dist/resources/*.js` (agent-kit, x402, mantle, examples).

---

## Dashboard / docs

Mantle uses a single dashboard (e.g. `mantle-devkit.vercel.app`) with docs and demo. Stellar’s `sdk-fe` should mirror that role: overview, package pages (x402-stellar-sdk, stellar-agent-kit, create-stellar-devkit-app), and copy-paste snippets that match the real APIs above.

---

When in doubt, prefer the Mantle DevKit’s structure and naming so both devkits feel consistent to developers switching between chains.

---

## How the Stellar DevKit packages fit together

```
┌─────────────────────────────────────────────────────────────────┐
│  User / Developer                                                │
└─────────────────────────────────────────────────────────────────┘
         │
         ├── create-stellar-devkit-app (CLI)
         │         scaffolds → agent-kit template (stellar-agent-kit)
         │                  → x402-api template (x402-stellar-sdk)
         │
         ├── stellar-agent-kit (SDK)
         │         StellarAgentKit: payments, DEX, lending, oracles
         │         used by: CLI tools, sdk-fe demos, scaffolded apps
         │
         ├── x402-stellar-sdk (server + client)
         │         Paywall routes (Hono/Next/Express), verify Stellar payments
         │         used by: x402-api template, sdk-fe docs examples
         │
         ├── stellar-devkit-mcp (MCP server)
         │         Resources + tools for AI (Claude/Cursor); stays in sync
         │         with stellar-agent-kit and x402-stellar-sdk APIs
         │
         └── sdk-fe + ui
                   Dashboard, docs, snippets; all UI from ui/
```

- **stellar-agent-kit** and **x402-stellar-sdk** are the core libraries; they do not depend on each other.
- **create-stellar-devkit-app** only copies template files; generated apps depend on the published SDK packages.
- **stellar-devkit-mcp** exposes documentation and code examples that should match the public APIs of the two SDKs.
- **sdk-fe** is the devkit dashboard and docs site; it may import from `ui/` and link to the SDK packages for examples.
