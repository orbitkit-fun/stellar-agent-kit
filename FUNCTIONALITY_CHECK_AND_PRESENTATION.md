# Stellar Agent Kit — Functionality Check & Judge Presentation Workflow

## Part 1: Functionality Check (per feature)

Use this to verify each feature before the demo. Check off as you confirm.

---

### 1. Unified SDK (`stellar-agent-kit`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 1.1 | StellarAgentKit + initialize | Run `node scripts/test-sdk.mjs` from repo root. Should print "Loading... OK", "initialize()... OK". | Node 18+ |
| 1.2 | DEX quote | Same script with `SOROSWAP_API_KEY` set. Should print "dexGetQuote(XLM, USDC, 1)... OK". | SOROSWAP_API_KEY (optional for script) |
| 1.3 | DEX swap | Use UI: Swap page → connect wallet → enter amount → get quote → Swap → sign in Freighter → submit. Or CLI agent with privateKey in tool. | SOROSWAP_API_KEY, Freighter |
| 1.4 | dexSwapExactIn | Programmatic only; not exposed in UI. Use SDK in code: `agent.dexSwapExactIn(from, to, amount)`. | — |
| 1.5 | sendPayment | Use UI: Swap page → Send tab → enter destination + amount → Send → sign → submit. Or CLI: `node dist/index.js pay <S...> <G...> <amount> [--network]`. | Freighter (UI) or secret key (CLI) |
| 1.6 | Config (MAINNET_ASSETS, getNetworkConfig) | Import from `stellar-agent-kit` in any script; use in Code generator snippets (DevKit). | — |
| 1.7 | createDexClient | Used internally by StellarAgentKit; SoroSwap is wired. No direct UI; SDK design allows more DEXes. | — |

**Summary:** SDK works via `scripts/test-sdk.mjs` (load + init + optional quote). Full swap/send via UI or CLI.

---

### 2. AI agent (CLI, root `src/`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 2.1 | CLI balance | `node dist/index.js balance <G...> [--network=testnet\|mainnet]`. Expect JSON with XLM + trust lines. | Build root first: `npm run build:root` (or full build) |
| 2.2 | CLI pay | `node dist/index.js pay <secret> <G...> <amount> [--network] [--asset] [--issuer]`. Expect "Transaction submitted: <hash>". | Valid secret, destination, network |
| 2.3 | CLI agent | `node dist/index.js agent [--api-key <key>]`. Interactive chat; ask "what's my balance for G...?" or "get a swap quote XLM to USDC 1". | GROQ_API_KEY or --api-key (OpenAI-compatible) |
| 2.4–2.8 | Tools (check_balance, swap_asset, get_swap_quote, create_trustline, send_payment) | Exercised through CLI agent when you ask balance/quote/swap/trustline/send payment. | Same as 2.3; SOROSWAP_API_KEY for swap |
| 2.8 | StellarClient | Used by CLI balance/pay and by agent tools. No direct test; implied by 2.1, 2.2. | — |

**Summary:** Build root (`npm run build:root`), then run `balance`, `pay`, and `agent` from repo root. Agent needs an API key for the LLM.

---

### 3. MCP server (`stellar-devkit-mcp`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 3.1 | MCP server (ListTools, CallTool) | Cursor MCP config points to local `node .../packages/stellar-devkit-mcp/dist/index.js`. Restart Cursor; open new chat. | Cursor, mcp.json configured |
| 3.2 | Resources | MCP exposes resources (stellar://...); Cursor lists "3 resources". Optional: ask Claude to read a resource. | — |
| 3.3 | get_stellar_contract | In **new** Cursor chat: "Use the Stellar DevKit MCP to get the SoroSwap mainnet contract ID." Reply should include contract ID and show tool use. | New chat (so tools are attached) |
| 3.4 | get_sdk_snippet | In same or new chat: "Call get_sdk_snippet with operation swap and show me the code." Reply should include snippet. | — |
| 3.5 | get_quote | With SOROSWAP_API_KEY set where MCP runs: "Get a swap quote for 1 XLM to USDC." Reply should show live quote. | SOROSWAP_API_KEY in MCP env |

**Summary:** MCP works when Cursor uses the **local** build (not npx, due to published package shebang bug). New chat is required so the model gets the tool list. Tool descriptions are tuned so the model invokes them.

---

### 4. x402 payments (`x402-stellar-sdk`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 4.1 | Server middleware | Use scaffolder: `npx create-stellar-devkit-app my-x402 --template x402-api` (or similar). Run app; protect a route with x402; curl returns 402 with payment headers. | Node, template |
| 4.2 | Verification | Server verifies Stellar payment (Horizon/tx hash). Test by paying and retrying request with payment headers. | — |
| 4.3 | Client (x402Fetch) | In a client app, call x402Fetch with payWithStellar callback; on 402, pay then retry with tx hash. | Server endpoint that returns 402 |

**Summary:** No x402 flow in the main UI. Verify via scaffolder template (x402-api) or by integrating server + client in a small test app. DevKit Code generator shows x402-server and x402-client snippets.

---

### 5. Scaffolder (`create-stellar-devkit-app`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 5.1 | CLI | `npx create-stellar-devkit-app my-demo` (or from repo: run from package). Should prompt/create project. | npm/npx |
| 5.2 | Template agent-kit | Creates Next.js app with stellar-agent-kit and quote route. Run it; call /api/quote or use starter UI. | — |
| 5.3 | Template x402-api | Creates Express + x402. Run and hit payment-gated route; get 402, pay, retry. | — |

**Summary:** Run from published package or from `packages/create-stellar-devkit-app`. Both templates are minimal; full reference is the repo `ui/` app.

---

### 6. Warly UI (`ui/`)

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 6.1 | Landing | Open `/`. Hero, capabilities section, CTA. Nav: Capabilities, DevKit, Swap, Wallet, Get started. | `npm run dev:ui` (or `cd ui && npm run dev`) |
| 6.2 | Wallet | Click connect (Freighter); disconnect; copy address; explorer link. Works on testnet/mainnet. | Freighter extension |
| 6.3 | Swap | Go to Swap; connect wallet; enter amount; get quote (XLM ↔ USDC); set slippage; Swap → sign in Freighter → submit. Success + tx hash/link. | SOROSWAP_API_KEY in ui/.env.local, Freighter |
| 6.4 | Send | Swap page → Send tab (or /swap?tab=send). Enter destination + amount; Send → sign → submit. | Freighter |
| 6.5 | DevKit page | Go to /devkit. Tabs: Overview, Protocols, Code generator, MCP. Overview: create project → APP Id, API endpoint, payout wallet. | — |
| 6.6 | Protocols (in DevKit) | DevKit → Protocols tab. Cards: Swap SoroSwap, Phoenix, Aqua, Get quote, Send payment, x402 server/client. Click card → Code generator shows code. | — |
| 6.7 | Code generator | DevKit → Code generator. Select operation; see snippet; Copy; "Try it" for Swap/Send opens /swap or /swap?tab=send. | — |
| 6.8 | MCP tab | DevKit → MCP. Config snippet for Cursor; tool list; "How to show MCP working" with prompts. | — |
| 6.9 | API routes | Swap: /api/swap/quote, /api/swap/build, /api/swap/submit. Send: /api/send/build, /api/send/submit. Balance: /api/balance. Validate: /api/v1/validate?appId=... (returns valid only if appId registered via DevKit). Projects: POST /api/v1/projects to register. | Backend running |

**Summary:** Full UI works with `npm run dev:ui`. Swap/Send require Freighter; swap execute requires SOROSWAP_API_KEY. DevKit is self-contained (project creation is localStorage + validate route).

---

### 7. Publishing & consumption

| # | Feature | How to verify | Prereqs |
|---|---------|----------------|---------|
| 7.1 | npm packages | `npm install stellar-agent-kit`, `stellar-devkit-mcp`, `x402-stellar-sdk`, `create-stellar-devkit-app` in a clean project. | npm |
| 7.2 | Install | In new folder: `npm init -y && npm install stellar-agent-kit`; require and call StellarAgentKit. | — |
| 7.3 | Scaffold | `npx create-stellar-devkit-app my-app` (after publish). | — |

**Summary:** All four packages are published; install and npx work from npm.

---

## Part 2: Presentation Workflow for Judges

Use this as a **single run-through** (about 5–8 minutes). Speak to the bullets; do the actions in order.

---

### Opening (30 sec)

- **Say:** "This is the Stellar Agent Kit — an agentic devkit for Stellar: unified SDK, AI agent CLI, MCP for Cursor, payment-gated APIs with x402, and a full demo UI."
- **Do:** Open the app (landing). Scroll to Capabilities. "Swap, send, quotes, and payment-gated APIs; all usable by code or by an AI agent."

---

### 1. DevKit — Project & key (1 min)

- **Say:** "First, the DevKit: create a project and get a key, like other devkits."
- **Do:** Navbar → **DevKit** → **Overview**.
  - Enter project name (e.g. "Stellar Demo") → **+ Create Project**.
  - Show **APP Id** (reveal/hide with eye).
  - **Copy** the **API Endpoint** — "You use this in your server SDK config."
  - Optionally show **Payout wallet** (edit/copy).
- **Say:** "Project is stored locally; we have a validate endpoint so the flow is real."

---

### 2. Protocols & Code generator (1 min)

- **Say:** "We support multiple DeFi protocol integrations; one SDK flow covers SoroSwap, Phoenix, and Aqua."
- **Do:** DevKit → **Protocols** tab.
  - Scroll: "Swap on SoroSwap, Phoenix, Aqua, Get quote, Send payment, x402 server and client."
- **Do:** DevKit → **Code generator** tab.
  - Click **Swap on SoroSwap** → "This is the published stellar-agent-kit code; developers copy this."
  - Click **Copy**.
  - Point out **Try it** — "That opens the live Swap page."

---

### 3. Swap — Live (1.5 min)

- **Say:** "Now a real swap so you see it end-to-end."
- **Do:** Click **Try it** (or Navbar → **Swap**).
  - **Connect** wallet (Freighter); choose testnet or mainnet.
  - Enter amount (e.g. 1 XLM); wait for **quote**.
  - "Quote comes from our API, which uses the SoroSwap aggregator."
  - Click **Swap** → **Sign** in Freighter → wait for **success**.
- **Say:** "That’s a real on-chain swap using the same SDK we showed in the Code generator."

---

### 4. Send (30 sec)

- **Say:** "Same app does payments."
- **Do:** On Swap page → **Send** tab.
  - Enter destination and amount → **Send** → sign in Freighter → success.
- **Say:** "Payments use the same agent kit; no secret key in the browser, only signing."

---

### 5. MCP (1 min)

- **Say:** "For AI in the IDE we ship an MCP server so Claude can use Stellar contract IDs and code snippets."
- **Do:** DevKit → **MCP** tab.
  - Show **Install & configure in Cursor** (command: node, args: path to local dist).
  - Show **Tools:** get_stellar_contract, get_sdk_snippet.
- **Say:** "In a **new** Cursor chat, when I ask for the SoroSwap mainnet contract ID, Claude calls our MCP and returns it."
- **Do:** If you have Cursor open: open a **new** chat and say: "Use the Stellar DevKit MCP to get the SoroSwap mainnet contract ID." Show the reply with the contract ID (and tool use if visible).
- **Say:** "So the MCP SDK is working: Cursor discovers the tools, and the model invokes them in a new chat."

---

### 6. Terminal — SDK (30 sec)

- **Say:** "Same SDK runs in Node for backends or scripts."
- **Do:** Terminal from repo root: `node scripts/test-sdk.mjs`.
  - Show output: "StellarAgentKit loads and initializes."
  - If SOROSWAP_API_KEY is set: "With API key it also gets a real quote."
- **Say:** "That’s the same package we showed in the Code generator."

---

### 7. Optional: CLI agent (30 sec)

- **Say:** "We also have a CLI agent: balance, pay, and interactive chat with tools for balance, swap quote, and trustline."
- **Do:** `node dist/index.js balance <any G...> --network testnet` (quick). Optionally: `node dist/index.js agent` and one question (need API key).

---

### Closing (30 sec)

- **Say:** "You’ve seen: create a project and get a key, browse DeFi integrations and copy SDK code, run a real swap and send, MCP for AI in the IDE, and the same SDK in the terminal. Everything is published and usable."
- **Do:** Optionally open **Get started** (GitHub) or npm pages for the packages.

---

## Quick reference: what to have running

| Item | Purpose |
|------|--------|
| UI | `npm run dev:ui` (or `cd ui && npm run dev`) — landing, DevKit, Swap, Send |
| Freighter | Installed and unlocked; testnet/mainnet as needed |
| SOROSWAP_API_KEY | In `ui/.env.local` for swap quote + execute |
| Cursor MCP | mcp.json with stellar-devkit pointing to local `node .../stellar-devkit-mcp/dist/index.js` |
| New Cursor chat | For MCP demo so tools are attached |
| Terminal | Repo root for `node scripts/test-sdk.mjs` and `node dist/index.js balance/pay/agent` (root built) |

---

## One-line feature summary for judges

- **SDK:** One package for quote, swap, send; SoroSwap aggregator (SoroSwap + Phoenix + Aqua).
- **AI agent:** CLI with balance, pay, and chat using tools (check_balance, swap_quote, swap_asset, create_trustline).
- **MCP:** Server for Cursor; tools for contract IDs and SDK snippets; works in a new chat.
- **x402:** Payment-gated APIs with Stellar; server + client packages; scaffold template.
- **Scaffolder:** Two templates (agent-kit, x402-api) via npx.
- **UI:** Swap, Send, DevKit (project + key, Protocols, Code generator, MCP); wallet via Freighter; no secret in browser.
