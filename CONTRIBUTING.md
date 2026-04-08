# Contributing to Stellar DevKit

Thank you for your interest in contributing to Stellar DevKit. This document walks you through the repository structure, current open problems, proposed improvements, and how to submit a good contribution.

---

## Table of Contents

- [Repository overview](#repository-overview)
- [Getting started](#getting-started)
- [Repository walkthrough](#repository-walkthrough)
- [Open issues and known problems](#open-issues-and-known-problems)
- [Proposed improvements and feature ideas](#proposed-improvements-and-feature-ideas)
- [Good first issues for community contributors](#good-first-issues-for-community-contributors)
- [Contribution workflow](#contribution-workflow)
- [Code style and conventions](#code-style-and-conventions)
- [Commit message format](#commit-message-format)
- [Publishing packages](#publishing-packages)

---

## Repository overview

Stellar DevKit is a monorepo containing four published npm packages and a reference Next.js UI (Orbit).

```
stellar-devkit/
├── packages/
│   ├── stellar-agent-kit/        # Core TypeScript SDK (DEX, lending, oracles, payments)
│   ├── stellar-devkit-mcp/       # MCP server for Cursor and Claude
│   ├── x402-stellar-sdk/         # HTTP 402 payment-gated API toolkit
│   └── create-stellar-devkit-app/ # CLI scaffolder
├── ui/                            # Reference Next.js app (Orbit)
├── src/                           # Root-level CLI agent entry point
└── docs/                          # Additional documentation assets
```

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Stellar Freighter wallet (for UI testing)

### Install

```bash
# Clone the repo
git clone https://github.com/orbitkit-fun/stellar-agent-kit.git
cd stellar-agent-kit

# Install root and all workspace dependencies
npm install
```

### Run the UI

```bash
cd ui
cp .env.example .env.local   # Fill in required keys — see docs/ENV.md
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Build packages

```bash
# Build a specific package
cd packages/stellar-agent-kit
npm run build

# Typecheck a package
npm run typecheck
```

---

## Repository walkthrough

### `packages/stellar-agent-kit`

The core SDK. Exposes a unified API for Stellar DeFi operations:

| Module | File | What it does |
|---|---|---|
| DEX (SoroSwap) | `src/dex/soroSwap.ts` | Swap quotes, build & submit swap txs |
| Lending (Blend) | `src/lending/blend.ts` | Supply, borrow, repay via Blend Protocol |
| Oracle (Reflector) | `src/oracle/reflector.ts` | Fetch on-chain price feeds |
| Payments | `src/payments/` | Send XLM, path payments, trustlines |
| Config | `src/config/` | Protocol addresses, asset lists, network config |
| Agent | `src/agent.ts` | `StellarAgentKit` class — main public entry point |

Builds to both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) via `tsup`.

### `packages/stellar-devkit-mcp`

An MCP (Model Context Protocol) server. When configured in Cursor or Claude Desktop, it provides:
- Stellar contract IDs and addresses
- SDK code snippets for common operations
- Live SoroSwap quotes on demand

Entry point: `src/index.ts`. All tools are registered in a single file.

### `packages/x402-stellar-sdk`

Zero-dependency toolkit for HTTP 402 payment-gated APIs:

- **Server** — Middleware for Next.js, Hono, and Express. Requires a valid Stellar payment before serving a response.
- **Client** — `x402Fetch` and `payWithStellar` helpers for the browser or Node.js.
- **Verification** — `verifyPayment` checks a Stellar transaction hash against Horizon.

### `packages/create-stellar-devkit-app`

Interactive CLI that scaffolds new projects. Currently supports two templates:

- `default` — Full Agent Kit setup with Next.js, swap/send UI, and the DevKit dashboard
- `x402-api` — A minimal Express/Next.js API server with an x402-gated `/api/premium` endpoint

### `ui/` — Orbit (reference app)

A Next.js 16 app that demonstrates all DevKit features. Key areas:

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/swap` | SoroSwap token swap UI |
| `/devkit` | DevKit dashboard (App ID, payout wallet, stats) |
| `/docs` | In-app documentation |
| `/onboarding` | Guided onboarding for 10%/25%/50% user tracks |
| `/extensions` | Ecosystem integrations catalog |
| `/pricing` | Subscription plans (Dodo Payments) |
| `/api/swap` | API routes for swap |
| `/api/bridge` | Allbridge bridge routes |
| `/api/lending` | Blend supply/borrow routes |
| `/api/x402` | x402 payment gate routes |
| `/api/credits` | Credits balance and redemption |

---

## Open issues and known problems

These are actively known problems in the codebase. Pull requests fixing any of these are welcome.

### SDK

- **`x402-stellar-sdk` is unbuilt in the monorepo.** The package exists in `packages/x402-stellar-sdk/` but its `dist/` is not committed. Any package that imports from `x402-stellar-sdk/server/next` will fail at build time. The UI works around this by inlining the logic in `ui/lib/x402.ts`. A proper fix would ensure `dist/` is built before dependent packages resolve it, or the package is published and consumed from npm.

- **`StellarAgentKit` class is missing several tool bindings.** The `src/agent.ts` class exposes swap and lending methods but does not yet expose oracle queries (`getPrice`), bridge operations, or the full FxDAO stablecoin interaction surface.

- **No test suite.** None of the packages have unit or integration tests. Critical paths like `soroSwap.ts`, `blend.ts`, and `verifyPayment` in x402 have no coverage.

- **Horizon transaction verification in x402 is fragile.** `verifyPayment` in `ui/lib/x402.ts` iterates through operation records to match amounts and destinations. It does not handle multi-op transactions, fee bumps, or clawback operations. Edge cases can produce false negatives.

- **`create-stellar-devkit-app` templates are not kept in sync.** The `packages/create-stellar-devkit-app/templates/` directory diverges from the actual `ui/` app over time. There is no CI check that validates templates build cleanly.

### UI

- **Dodo Payments SDK origin mismatch.** The `dodopayments-checkout` SDK internally uses iFrameResizer with `checkOrigin` hardcoded to `https://test.dodopayments.com`, but the iframe posts messages from `https://test.checkout.dodopayments.com`. There is no public API to fix this. Currently suppressed with a `console.error` patch in `ui/app/pricing/page.tsx`.

- **YouTube iframe captures scroll.** The "See it in action" video section on the onboarding page uses a click-to-play overlay to prevent the iframe from capturing wheel events, but this means fullscreen and playback controls are not accessible while the video is playing inline.

- **No loading state for bridge route.** `ui/app/api/bridge/build/route.ts` has no timeout, and the Allbridge SDK can take 10–20 s on slow connections. The frontend shows a spinner but has no timeout or error recovery path.

- **Credits system requires Supabase.** The credits feature in `ui/lib/credits-store.ts` hard-depends on a Supabase instance. New contributors cannot run the full UI locally without setting up a Supabase project and running the SQL schema manually. The schema is defined inline in `credits-store.ts` and is not in a migration file.

- **`ui/app/api/agent/route.ts` uses a global in-memory map.** The agent conversation history is stored in a `Map` that does not survive server restarts and cannot scale beyond a single process. This needs to be backed by Redis, Supabase, or another persistent store.

- **No environment variable validation on startup.** Missing env vars (`SUPABASE_URL`, `GROQ_API_KEY`, etc.) produce cryptic runtime errors. A startup validation pass (e.g., using `zod`) would surface missing config immediately.

---

## Proposed improvements and feature ideas

These are scoped features that are not yet built but would meaningfully improve the project. Community contributors are encouraged to pick one up and open a tracking issue before starting work.

### SDK enhancements

| Idea | Description | Difficulty |
|---|---|---|
| **Soroban token list integration** | Pull a live verified token list from SoroSwap or Stellar Expert into the SDK config so consumers always have up-to-date asset data | Medium |
| **Full FxDAO vault operations** | Add SDK methods to open, manage, and close FxDAO vaults directly via `StellarAgentKit` | Medium |
| **Path payment optimization** | Add a helper that fetches multiple path payment offers via Horizon and picks the best rate | Hard |
| **Transaction history helpers** | Add methods to `StellarAgentKit` to fetch account transaction history and decode operations into human-readable summaries | Easy |
| **Multi-sig support** | Allow operations to return an unsigned XDR so multi-sig wallets can collect signatures before submission | Hard |

### MCP server

| Idea | Description | Difficulty |
|---|---|---|
| **Live account balance tool** | Add an MCP tool `get_account_balance` that takes a public key and returns XLM + all token balances | Easy |
| **Swap execution tool** | Let Cursor/Claude trigger an actual swap (currently only quotes are available) | Medium |
| **Contract ABI tool** | Expose a tool that fetches and summarizes a Soroban contract's interface from Stellar Expert | Medium |

### x402 SDK

| Idea | Description | Difficulty |
|---|---|---|
| **Express middleware** | A dedicated `withX402` handler for Express (currently only Next.js and Hono are fully supported) | Easy |
| **Receipt storage** | After a successful payment, store the tx hash + metadata in a pluggable store (in-memory, Redis, Supabase) so duplicate payment detection works properly | Medium |
| **Client UI component** | A React `<X402Gate>` component that wraps content, detects a 402, and shows a Freighter payment prompt inline | Hard |

### CLI / scaffolder

| Idea | Description | Difficulty |
|---|---|---|
| **Blend lending template** | A new `--template lending` that scaffolds a minimal supply/borrow UI | Medium |
| **AI agent template** | A `--template agent` that scaffolds a Next.js app with the DevKit MCP pre-configured for Cursor | Medium |
| **Dry-run mode** | `--dry-run` flag that prints what files would be generated without writing anything | Easy |
| **Template validation CI** | A GitHub Actions job that builds every template on every PR to catch template drift | Easy |

### UI / Orbit

| Idea | Description | Difficulty |
|---|---|---|
| **Dark/light theme toggle** | The site is dark-only. Adding a proper light theme would improve accessibility | Medium |
| **Mobile swap UI** | The swap interface is not fully optimised for small screens | Medium |
| **Transaction receipt page** | After a successful swap or send, show a shareable receipt page with the tx hash and decoded operation summary | Medium |
| **Credits dashboard** | A dedicated page showing credit usage over time, transaction log, and plan upgrade prompts | Medium |
| **Docs search** | Full-text search across the in-app docs using Fuse.js or a lightweight index | Easy |

---

## Good first issues for community contributors

If you are new to the project, these are well-scoped tasks with clear acceptance criteria.

1. **Add a test for `verifyPayment`** — Write a unit test for `ui/lib/x402.ts::verifyPayment` using a mocked Horizon response. Acceptance: the function returns `true` for a valid payment and `false` for wrong amount, wrong destination, or expired tx.

2. **Extract Supabase schema to a migration file** — Move the SQL schema currently inlined in `ui/lib/credits-store.ts` into `ui/supabase/migrations/001_credits.sql` and update the README setup section.

3. **Add `get_account_balance` to MCP** — In `packages/stellar-devkit-mcp/src/index.ts`, register a new tool that calls Horizon's `/accounts/:id` endpoint and returns a formatted balance summary.

4. **Add env validation on startup** — Create `ui/lib/env.ts` that uses `zod` to validate all required environment variables at startup and throws a descriptive error if any are missing.

5. **Dry-run flag for CLI scaffolder** — Add a `--dry-run` flag to `packages/create-stellar-devkit-app/src/index.ts` that logs the files to be created without writing them.

6. **Add a `--template lending` scaffold** — Copy the structure of the existing `x402-api` template and create a minimal Blend supply/borrow demo app.

7. **Fix mobile layout for swap interface** — `ui/components/swap-interface.tsx` breaks on screens narrower than 375 px. Fix the layout so it remains usable on mobile.

8. **Add `Transaction history` method to `StellarAgentKit`** — Add `getTransactionHistory(publicKey: string, limit?: number)` to `packages/stellar-agent-kit/src/agent.ts` using the Horizon `/accounts/:id/transactions` endpoint.

---

## Contribution workflow

1. **Open an issue first** for anything beyond a typo or one-line fix. Describe the problem, your proposed approach, and expected outcome. This avoids duplicate work.

2. **Fork the repository** and create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make your changes**, keeping them focused. One pull request per logical change.

4. **Build and typecheck** before pushing:
   ```bash
   # For a package
   cd packages/<package-name>
   npm run build
   npm run typecheck

   # For the UI
   cd ui
   npm run build
   ```

5. **Open a pull request** against `main`. Fill in the PR template: what changed, why, how to test it.

6. A maintainer will review within a few days. Be prepared for feedback and iteration.

---

## Code style and conventions

- **TypeScript everywhere.** No plain `.js` files in packages or `ui/lib`.
- **No `any`.** Use `unknown` and narrow the type, or define an interface.
- **Tailwind for styling** in the UI. Do not introduce new inline styles or CSS modules unless there is a specific reason.
- **No new colors.** The UI uses a strict zinc/white/violet palette. Do not introduce new colour values.
- **Component naming** — PascalCase for components, camelCase for utilities and hooks.
- **API routes** — All `ui/app/api/**` routes must return `NextResponse.json(...)` and handle errors with appropriate HTTP status codes.
- **Imports** — Use path aliases (`@/components/...`, `@/lib/...`) in the UI. Use relative imports inside packages.

---

## Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`

**Examples:**

```
feat(mcp): add get_account_balance tool
fix(x402): handle multi-op transactions in verifyPayment
docs(contributing): add good first issues section
chore(ui): remove unused ExternalLink import
```

---

## Publishing packages

> This section is for maintainers only.

See [PUBLISHING.md](./PUBLISHING.md) for the full release workflow. In short:

1. Bump versions in each changed package's `package.json`.
2. Build all packages: `npm run build` in each.
3. Publish: `npm publish --access public` from each package directory.
4. Tag the release: `git tag v<version> && git push --tags`.

---

## Questions?

Open a [GitHub Discussion](https://github.com/stellar/stellar-agent-kit/discussions) or join the [Stellar Developer Discord](https://discord.gg/stellardev).
