# Getting Started — Stellar DevKit

## What’s done

| Area | Status |
|------|--------|
| **stellar-agent-kit** | ✅ `StellarAgentKit`, `dexGetQuote`, `dexSwap`, `dexSwapExactIn`, `sendPayment`; SoroSwap wired; `MAINNET_ASSETS` / `TESTNET_ASSETS` |
| **x402-stellar-sdk** | ✅ Server middleware (Express-style), Horizon payment verification, Hono + Next adapters, `x402Fetch` client |
| **create-stellar-devkit-app** | ✅ CLI with `agent-kit` and `x402-api` templates |
| **stellar-devkit-mcp** | ✅ MCP server (resources + tools for contracts/snippets) |
| **Warly UI (this repo)** | ✅ Landing, Swap (Freighter + API routes), DevKit page, Protocols page with real code per protocol, wallet connect |
| **Docs** | ✅ `DEVKIT_README.md` quick start; protocol code snippets with real contract IDs and APIs |

---

## Published packages (npm)

All four packages are on npm. Install and use in any Node/TS project:

| Package | Install | Purpose |
|---------|--------|---------|
| **stellar-agent-kit** | `npm install stellar-agent-kit` | Unified SDK: swap quote/execute, send payments. `StellarAgentKit`, `dexGetQuote`, `dexSwap`, `sendPayment`, config. |
| **x402-stellar-sdk** | `npm install x402-stellar-sdk` | Payment-gated APIs: server middleware (Hono/Express/Next), verification, `x402Fetch` client. |
| **create-stellar-devkit-app** | `npx create-stellar-devkit-app my-app` | Scaffold new app from **agent-kit** or **x402-api** template. |
| **stellar-devkit-mcp** | `npm install stellar-devkit-mcp` | MCP server for AI tools: resources + tools (`get_stellar_contract`, `get_sdk_snippet`). Run as MCP server in Claude etc. |

See **PUBLISHING.md** for versioning and re-publish. See **FEATURES.md** for the full feature checklist.

---

## What’s not done (or optional)

| Area | Notes |
|------|--------|
| **Publishing** | All four packages are on npm. See **PUBLISHING.md** for re-publish/versioning. Anyone can `npm install` / `npx create-stellar-devkit-app`. |
| **Agent-kit template** | CLI template is minimal (see “Starter kit” below). For a full swap UI, use the **`ui`** app in this repo as the reference/starter. |
| **SoroSwap API key** | Required for **executing** swaps (quote works without it). Get from [SoroSwap](https://soroswap.finance) / their developer console. |
| **Lending / oracles** | Implemented: Reflector oracle (`getPrice`), Blend lending (`lendingSupply`, `lendingBorrow`). |

---

## What you need to do to get the SDK to work

### 1. Build the monorepo

From repo root:

```bash
npm install
npm run build
```

This builds `packages/stellar-agent-kit`, `packages/x402-stellar-sdk`, `packages/create-stellar-devkit-app`, and `packages/stellar-devkit-mcp`.

### 2. Use the SDK in code

**Option A — From this repo (e.g. `ui` or your own app in the monorepo)**

- Add a workspace dependency in your app’s `package.json`:
  ```json
  "stellar-agent-kit": "workspace:*"
  ```
  or use the `ui` app, which already uses local agent-kit via `ui/lib/agent-kit/` and API routes.

**Option B — Standalone project (install from npm)** *(recommended for new projects)*

Packages are on npm:

- `npm install stellar-agent-kit`
- Use as in `DEVKIT_README.md` (Quick Start). Set `SECRET_KEY` and `SOROSWAP_API_KEY` in `.env` for swap execute.

**Option C — Standalone project with local package (no publish)**

- Publish the package locally: `cd packages/stellar-agent-kit && npm link`
- In your app: `npm link stellar-agent-kit` (and ensure the package is built: `npm run build` in the package).

### 3. Environment variables

| Variable | Where | Purpose |
|----------|--------|--------|
| **SECRET_KEY** | Server / backend only | Stellar secret key (S...) for signing. **Never** expose in the browser. |
| **SOROSWAP_API_KEY** | Server / API routes that execute swaps | Required for swap **execute**; get from SoroSwap. Quote-only flows can work without it. |
| **NETWORK** | Optional | `testnet` or `mainnet`; some code defaults to testnet. |

For the **Warly UI** (`ui/`):

- Copy `ui/.env.local.example` to `ui/.env.local`.
- Set `SOROSWAP_API_KEY=sk_...` so the Swap page can execute swaps via `/api/swap/*`.

### 4. Wallet (browser)

- Install [Freighter](https://www.freighter.app/) so the UI can connect wallet, request network, and sign transactions (no secret key in the frontend).

### 5. x402 (payment-gated API)

- Set **X402_DESTINATION** to your Stellar account (G...) that receives payments.
- Clients use `x402Fetch` and a `payWithStellar` callback (e.g. Freighter) to pay then retry with the tx hash.

---

## Starter kit

You have three ways to get a “starter”:

### 1. Use the Warly app as the starter (recommended)

The **`ui`** folder in this repo is a full Next.js app with:

- Landing, DevKit page, Protocols page
- Swap UI (connect Freighter → quote → build → sign → submit via API routes)
- Wallet component and network handling

To run it:

```bash
cd ui
cp .env.local.example .env.local
# Edit .env.local: set SOROSWAP_API_KEY=sk_...
npm install
npm run dev
```

Open http://localhost:3000, connect Freighter, go to Swap. This is your **reference starter** for an app using the SDK.

### 2. CLI starter (minimal)

Scaffold a new project (packages are on npm):

```bash
npx create-stellar-devkit-app my-app
cd my-app
cp .env.example .env
# Set SECRET_KEY and SOROSWAP_API_KEY
npm install
npm run dev
```

- **agent-kit** template: minimal Next.js + `stellar-agent-kit` dependency; add your own pages (you can copy patterns from `ui/app` and `ui/app/api/swap`).
- **x402-api** template: Express server with one payment-gated route; run with `npm run dev`.

### 3. Copy from this repo

- For **Agent Kit (swap + DeFi)**: copy the `ui` app (or `ui/app`, `ui/components`, `ui/lib/agent-kit`, `ui/app/api/swap`) into your project and adapt.
- For **x402 API**: copy `packages/create-stellar-devkit-app/templates/x402-api` and extend.

---

## Testing

Use these steps to verify each package and the main flows work.

### Build (from repo root)

```bash
npm install
npm run build
```

This builds the root CLI (`dist/`), the four packages under `packages/*/dist/`, and (if you run full `npm run build`) the docs and UI.

### 1. Root CLI (balance, pay, agent)

From repo root after build:

- **Balance** (needs a Stellar address, e.g. testnet):
  ```bash
  node dist/index.js balance G... --network=testnet
  ```
  Output: JSON array of `{ code, issuer, balance }`.

- **Pay** (needs secret key + destination + amount; use testnet):
  ```bash
  node dist/index.js pay S... G... 10 --network=testnet
  ```

- **Agent** (interactive chat; needs `GROQ_API_KEY` or `--api-key`):
  ```bash
  # Windows: set GROQ_API_KEY=your-groq-key
  # Unix: export GROQ_API_KEY=your-groq-key
  node dist/index.js agent
  ```
  Try: “What’s the balance of G…” or “Get a quote to swap 10 XLM to USDC”.

### 2. stellar-agent-kit (SDK)

In a script or another project:

```bash
npm install stellar-agent-kit
```

```ts
import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";
const agent = new StellarAgentKit(process.env.SECRET_KEY!, "testnet");
await agent.initialize();
const quote = await agent.dexGetQuote(MAINNET_ASSETS.XLM, MAINNET_ASSETS.USDC, "10");
```

Set `SECRET_KEY` and (for swap execute) `SOROSWAP_API_KEY`.

### 3. create-stellar-devkit-app (scaffolder)

From anywhere (uses published package):

```bash
npx create-stellar-devkit-app test-app
cd test-app
npm install
```

Choose **agent-kit** or **x402-api** when prompted. Run `npm run dev` and open the URL shown.

### 4. stellar-devkit-mcp (MCP server)

From repo root after building packages:

```bash
node packages/stellar-devkit-mcp/dist/index.js
```

Or in a project that has `stellar-devkit-mcp` installed, run its `bin`. The server runs over stdio for MCP clients (e.g. Claude Desktop). Configure your MCP client to use this server to test resources and tools.

### 5. x402-stellar-sdk (payment-gated API)

Scaffold the x402 template and run the server:

```bash
npx create-stellar-devkit-app x402-test
cd x402-test
# Choose x402-api template
npm install
# Set X402_DESTINATION in .env
npm run dev
```

Hit the payment-gated route; you should get 402 and payment details, then (after paying with Stellar) retry to get the response.

### 6. Warly UI (Swap, Send, wallet)

From repo root:

```bash
cd ui
cp .env.local.example .env.local
# Set SOROSWAP_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000 → connect Freighter → go to **Swap** or **Send**. Quote works without an API key for some flows; execute swap needs `SOROSWAP_API_KEY`.

---

## Quick checklist

- [ ] `npm install` and `npm run build` at repo root (or use published packages: `npm install stellar-agent-kit` etc.)
- [ ] For Swap in `ui`: set `SOROSWAP_API_KEY` in `ui/.env.local`
- [ ] Install Freighter for browser
- [ ] To test each package: follow the **Testing** section above. For feature list: **FEATURES.md**. For re-publish: **PUBLISHING.md**
- [ ] Use **`ui`** as the main starter kit for a full SDK-based app

For more code examples and protocol snippets, see **DevKit** and **Protocols** in the Warly UI and `DEVKIT_README.md`.
