# Stellar Agent Kit starter

Minimal Next.js app using `stellar-agent-kit` for a DEX quote.

## Setup

1. Copy env and set your keys:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `SECRET_KEY` — Stellar secret key (S...) for the quote API (server-only). Use a mainnet key.
   - `SOROSWAP_API_KEY` — Required for DEX quotes (get one from the SoroSwap aggregator).

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000 and click **Get XLM → USDC quote**.

## Next steps

- Add a swap flow: call `agent.dexSwap(quote)` from an API route (keep `SECRET_KEY` server-side) or use Freighter to sign in the browser and submit via your API.
- Use the full [Warly UI](../../../ui) in this repo as reference for swap UI, wallet connect, and API routes.
