# Orbit — Complete Testing Sequence

Use this checklist to verify all features of the Orbit (Stellar DevKit) UI and flows. Run the app with `npm run dev:ui` from repo root (or `npm run dev` from `ui/`) and open **http://localhost:3000**.

---

## Prerequisites

- [ ] **Env** — `ui/.env.local` exists with at least:
  - `SOROSWAP_API_KEY=sk_...` (from SoroSwap) for Swap build/submit
  - Optional: `SECRET_KEY`, `GROQ_API_KEY` for agent chat
- [ ] **Freighter** — [Freighter](https://www.freighter.app/) extension installed and unlocked (for Connect Wallet, Swap, Send, Chat approve).
- [ ] **App running** — `npm run dev:ui` (or `cd ui && npm run dev`), browser at http://localhost:3000.

---

## 1. Navigation & layout

- [ ] **Navbar**
  - Orbit logo + “Orbit” text visible; clicking **Orbit** navigates to **/** (home).
  - Links visible: **Docs**, **DevKit**, **Demo**, **Chat**, **Pricing**.
  - **Connect Wallet** opens Freighter (or shows “Freighter not found” toast if not installed).
- [ ] **Mobile**
  - Resize to mobile width; hamburger menu opens sheet with Home, Docs, DevKit, Swap, Chat, Pricing, Get started.
  - **Home** link goes to **/**.
- [ ] **Favicon** — Tab shows Orbit favicon (may need hard refresh if cached).

---

## 2. Home / landing (/)

- [ ] **Hero**
  - Stellar logo, tagline “The developer suite for building on Stellar.”, CTAs: See what’s included, Docs, Try Swap, npm.
  - Dot pattern background in hero; subtle wave + mouse proximity glow.
- [ ] **Scroll**
  - “See what’s included” scrolls to **Everything your agents need** section.
- [ ] **SDK Features**
  - Four cards: Stellar Agent Kit, x402 Stellar SDK, Create DevKit App, Stellar DevKit MCP; each “Learn more” goes to correct link.
- [ ] **Protocols integrated**
  - Five protocol logos (SoroSwap, Blend, Allbridge, FxDAO, Reflector) with links.
- [ ] **Try it yourself**
  - Code snippet (stellar-agent-kit), “TRY IT OUT FOR YOURSELF” heading, “Take me to the code >>” → Docs.
  - Dot pattern background in this section.
- [ ] **Capabilities**
  - Tabs: **Agent tools** (Balance, DEX, Payments, x402) and **How it works** (4 steps); card links work.
- [ ] **Bottom CTA**
  - Docs, Try Swap, DevKit, Pricing buttons work.

---

## 3. Docs (/docs)

- [ ] **Sidebar**
  - Introduction, Getting Started, x402, Agent Kit, CLI & Scaffolding, MCP, Networks & Contracts; active section highlighted (purple).
- [ ] **Content**
  - Main heading: “Stellar DevKit documentation”.
  - Guide cards (Getting Started, x402, Agent Kit, etc.) scroll to correct sections.
  - Code blocks and tables render; internal links (e.g. to DevKit, Swap) work.
- [ ] **Docs assistant** (right panel on large screens)
  - Chat input; sending a message calls docs chat API and shows a response (or error).
- [ ] **Mobile**
  - Sidebar and assistant behavior (e.g. collapsible or hidden) acceptable on small screens.

---

## 4. DevKit (/devkit)

- [ ] **Overview tab**
  - **Create project**: Enter project name → “+ Create Project” → project created; APP Id (show/hide), API Endpoint (copy), Payout Wallet (edit/save/copy) visible.
  - Copy APP Id and API Endpoint; paste elsewhere to confirm.
  - **Delete project** (if present): Confirm and project cleared.
- [ ] **Protocols tab**
  - List of protocols with contract IDs and “Try it” / docs links where applicable.
- [ ] **Code generator tab**
  - Only **integrated** operations are listed (SoroSwap, Blend, Reflector, x402, send payment, full setup). Select any operation → code snippet appears; **Try it** and **Copy** on every item; “Try it” links to Swap, Send, Prices, or Docs as appropriate.
- [ ] **MCP tab**
  - Instructions and config snippet for Stellar DevKit MCP; links/copy work.

---

## 5. Protocols (/protocols)

- [ ] **Header**
  - “Agent Kit” title, “/ DeFi protocol integrations” subtitle.
- [ ] **Tabs**
  - **Protocol Explorer**: Cards for SoroSwap, Blend, Allbridge, FxDAO, Reflector (and others if present) with name, description, contract ID, copy, expand/collapse, external link.
  - **Code Generator**: Only **integrated** protocols (SoroSwap, Blend, Reflector); each has **Try it** and **Copy**; snippet and copy work.
- [ ] **Copy contract ID**
  - Copy button copies correct contract ID to clipboard.
- [ ] **External links**
  - “Open” / external link goes to protocol docs or URL.

---

## 6. Demo — Swap & Send (/swap)

- [ ] **Tabs**
  - **Swap**, **Send**, **Prices** switch correctly; URL updates (`/swap`, `/swap?tab=send`, `/swap?tab=prices`).
- [ ] **Swap**
  - **Without wallet**: Connect wallet CTA or message shown.
  - **With wallet**: From/To (e.g. XLM ↔ USDC), amount → **Get quote** → quote appears (rate, expected out, etc.).
  - **Swap (full flow)**: After quote, **Swap** → build → Freighter sign → submit; success message and/or balance update (requires `SOROSWAP_API_KEY`).
- [ ] **Send**
  - Recipient (G...), amount, asset (XLM/USDC) → **Build** → sign with Freighter → **Submit**; success or error.
- [ ] **Prices**
  - Symbol (e.g. XLM, USDC) → fetch price; value displays or error message.
- [ ] **Wallet**
  - Connected: address truncated in navbar; disconnect/copy from wallet dropdown if present.

---

## 7. Chat (/chat)

- [ ] **Without wallet**
  - Placeholder/message about connecting wallet for balance/swap.
- [ ] **With wallet**
  - Send message e.g. “What’s my balance?” → agent uses `check_balance`; response shows balance or error.
  - “Get a quote for 1 XLM to USDC” → agent uses `get_swap_quote`; response includes quote; **Approve** (or Execute) appears if quote returned.
- [ ] **Approve swap**
  - When agent returns a quote, **Approve** builds tx, opens Freighter to sign, submits; success/error and balance update.
- [ ] **Errors**
  - Invalid or unsupported message → graceful error in chat (no crash).

---

## 8. Pricing (/pricing)

- [ ] **Plans**
  - Free, Builder, Pro (or current plans) with features and CTA.
- [ ] **Upgrade / checkout**
  - Click paid plan CTA → redirect to Dodo (or configured) checkout; return with `?payment_id=...&status=succeeded` (or `success=1`) shows success message.
- [ ] **Success state**
  - After successful payment, “Payment successful” (or similar) and optional plan stored.

---

## 9. Wallet (global)

- [ ] **Connect**
  - Click **Connect Wallet** → Freighter popup; approve → “Wallet connected” toast; address shown in navbar.
- [ ] **Disconnect**
  - Open wallet dropdown (if available) → Disconnect; wallet state cleared.
- [ ] **Copy address**
  - Copy Stellar address from navbar/dropdown; paste elsewhere to verify.

---

## 10. API & backend (optional)

If testing against running UI and env is set:

- [ ] **Quote** — `POST /api/swap/quote` with valid body returns quote or clear error.
- [ ] **Balance** — `GET /api/balance?address=G...&network=mainnet` returns balances or error.
- [ ] **Agent chat** — `POST /api/agent/chat` with `messages` and optional `publicAddress` returns assistant message and optional `quote`.
- [ ] **Validate** — `GET /api/v1/validate?appId=...` returns validation result for DevKit project.

---

## 11. Responsive & UX

- [ ] **Desktop** — All main flows (home, docs, devkit, protocols, swap, chat, pricing) usable at 1280px+.
- [ ] **Tablet** — Layout adapts; navbar and key CTAs usable.
- [ ] **Mobile** — Hamburger menu; Swap/Chat/Docs/DevKit/Protocols/Pricing accessible; no horizontal scroll on main content.
- [ ] **Toasts** — Success/error toasts (connect, swap, send, copy) appear and dismiss.
- [ ] **Loading** — Buttons or UI show loading state during quote/build/submit/chat.

---

## How to start testing (dashboard-first workflow)

Start from the **dashboard** (DevKit) and follow these steps in order. Each step is a single, concrete action.

### Step 1: Open the dashboard

1. Run the app: from repo root run `npm run dev:ui` (or `cd ui && npm run dev`).
2. Open **http://localhost:3000** in your browser.
3. In the navbar, click **DevKit**. You are now on the dashboard (`/devkit`).

### Step 2: Create a project

1. Stay on the **Overview** tab (first tab).
2. In **Create project**, type a project name (e.g. `my-test-app`) in the input.
3. Click **+ Create Project**.
4. After creation you should see:
   - **APP Id** (with show/hide and copy).
   - **API Endpoint** (with copy).
   - **Payout Wallet** (with edit/save/copy).
5. Copy the **API Endpoint** and paste it somewhere (e.g. Notepad) to confirm copy works.
6. Optionally click **Edit** on Payout Wallet, enter a Stellar address (G...), and **Save**.

### Step 3: Try the Protocols tab

1. Click the **Protocols** tab.
2. You should see a list of protocols (SoroSwap, Blend, Allbridge, FxDAO, Reflector) with contract IDs.
3. Click a protocol row to expand; use **Contract** / **Docs** links or copy the contract ID to verify copy works.

### Step 4: Use the Code generator

1. Click the **Code generator** tab.
2. In the left list you see only **integrated** operations: Swap on SoroSwap, Get swap quote, Send payment, x402 server/client, One-shot swap, Full setup, Get price (Reflector), Lending supply/borrow (Blend).
3. Click any operation (e.g. **Swap on SoroSwap**). The right panel shows the code snippet and two actions:
   - **Try it** — opens the page where you can run that flow (e.g. Swap, Send, Prices, or Docs).
   - **Copy** — copies the snippet to the clipboard.
4. Click **Try it** for “Swap on SoroSwap”. You should land on **/swap** (Demo). Click **Try it** for “Get price (Reflector oracle)”. You should land on **/swap?tab=prices**.
5. Click **Copy** and paste into a text file to confirm the snippet was copied.

### Step 5: Run a real flow (Swap / Send / Prices)

1. Go to **Demo** (or click **Try Swap** in the navbar) to open **/swap**.
2. Click **Connect Wallet** and approve in Freighter (if installed).
3. **Swap tab**: Pick From (XLM) and To (USDC), enter amount (e.g. 1) → **Get quote**. You should see a quote or an error (e.g. missing `SOROSWAP_API_KEY`). If env is set, **Swap** → sign in Freighter → submit.
4. **Send tab**: Enter recipient (G...), amount, asset → **Build** → sign → **Submit**.
5. **Prices tab**: Enter symbol (e.g. XLM) → fetch; price or error appears.

### Step 6: Chat (optional)

1. Go to **Chat** (`/chat`).
2. With wallet connected, send e.g. “What’s my balance?” — you should get a response using the agent.
3. Send “Get a quote for 1 XLM to USDC” — you should see a quote and optionally **Approve** to run the swap.

### Step 7: Docs and Protocols page

1. **Docs** (`/docs`): Use the sidebar to jump to sections (Getting Started, x402, Agent Kit, etc.). Use the docs assistant (chat) if available.
2. **Protocols** (`/protocols`): **Protocol Explorer** shows all protocol cards. **Code Generator** tab shows only **integrated** protocols (SoroSwap, Blend, Reflector) with **Try it** and **Copy** for each snippet.

### Summary

- **Dashboard** = DevKit: create project → copy APP Id / API Endpoint / Payout Wallet.
- **Code generator** (DevKit and Protocols) = only integrated protocols; every item has **Try it** + **Copy**.
- **Try it** = open the page that demonstrates that operation (Swap, Send, Prices, or Docs).
- After creating a project, you can validate it (e.g. `/api/v1/validate?appId=...`), use the Code generator snippets in your app, and run Swap/Send/Prices/Chat to test end-to-end.

---

## Using code snippets

The code snippets in the Code generator are **copy-paste examples** from `stellar-agent-kit` and `x402-stellar-sdk`. Here’s how to use them.

### Where the snippets come from

- **DevKit → Code generator tab**: One list of operations (Swap, Quote, Send payment, x402 server/client, One-shot swap, Full setup, Get price, Lending supply/borrow). Each has a **Try it** link and **Copy**.
- **Protocols → Code Generator tab**: One snippet per **integrated** protocol (SoroSwap, Blend, Reflector). Same idea: **Try it** + **Copy**.

### How to use a snippet

1. **Copy**: Click **Copy** next to the snippet. The full code is in your clipboard.
2. **Paste**: Paste into your project (e.g. a new file in your app or a script).
3. **Env**: Set the required env vars the snippet expects:
   - `SECRET_KEY` — Stellar secret key (for agent; keep private).
   - `SOROSWAP_API_KEY` — For DEX quote/swap (get from SoroSwap). Required for swap/quote/one-shot/full-setup.
   - For x402 server: `X402_DESTINATION`, `NETWORK`, etc. (see Docs → x402).
4. **Install deps**: Ensure the right package is installed:
   - For agent snippets: `npm install stellar-agent-kit` (and `@stellar/stellar-sdk` if needed).
   - For x402 snippets: `npm install x402-stellar-sdk`.
5. **Run**: Run the file (e.g. `node your-file.mjs` or call it from your app). For swap/quote you need mainnet and `SOROSWAP_API_KEY` or the build step will fail.

### What each “Try it” does

- **Swap / Quote / One-shot swap / Full setup** → **Try it** opens **/swap**. There you can connect wallet, get a quote, and (with env set) submit a swap.
- **Send payment** → **Try it** opens **/swap?tab=send** so you can build and send a payment.
- **Get price (Reflector)** → **Try it** opens **/swap?tab=prices** so you can fetch a price by symbol.
- **x402 server / x402 client** → **Try it** opens **/docs#x402-stellar-sdk** where you can read how to set up the server and client.
- **Lending supply/borrow (Blend)** → **Try it** opens **/swap** (no dedicated lending demo; use the snippet in your own app or see Docs for Blend).

### Testing a snippet locally

1. Copy the snippet into a file (e.g. `scripts/test-swap.mjs`).
2. Create/use a `.env` with `SECRET_KEY` and (for swap) `SOROSWAP_API_KEY`.
3. Run: `node scripts/test-swap.mjs` (or `npx tsx scripts/test-swap.ts` if you use TypeScript).
4. Check the output (e.g. “Swap tx hash: …” or errors). For swap, ensure you have a small amount of XLM and that the keys are for mainnet if the snippet uses mainnet.

---

## Quick smoke (minimal pass)

1. Open **/** → click **Orbit** → stay on home.
2. **Docs** → scroll one section; click one internal link.
3. **DevKit** → create a project → copy API endpoint.
4. **Protocols** → open one protocol card; copy contract ID.
5. **Swap** → Connect Wallet → Get quote (XLM → USDC, 1) → see quote or error.
6. **Chat** → send “What’s my balance?” (with wallet connected) → see response or error.
7. **Pricing** → page loads; one plan CTA click (can cancel checkout).

---

## Sign-off

- [ ] All sections above tested (or N/A noted).
- [ ] No blocking bugs for: navigation, wallet connect, swap quote, send build, chat, DevKit project creation, docs and protocols links.
- [ ] Env and Freighter requirements documented for future testers.
