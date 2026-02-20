# Stellar Paywalled API (x402)

Minimal Express server with one premium route gated by Stellar payment via `x402-stellar-sdk`.

## Setup

1. Copy env and set your keys:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `X402_DESTINATION` — Your Stellar account (G...) that receives payments. **Required.**
   - `NETWORK` — `testnet` or `mainnet` (default: testnet). Use testnet for development.
   - `PORT` — Server port (default: 3000).

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Request the premium endpoint:
   - Without payment: `GET http://localhost:3000/api/premium` → **402 Payment Required** with headers `X-402-Amount`, `X-402-Asset-Code`, `X-402-Network`, `X-402-Destination`, etc.
   - After paying the required amount to `X402_DESTINATION` (same asset/network), send the transaction hash in header `X-402-Transaction-Hash` and retry → **200** with premium content.

## Env vars summary

| Variable           | Description |
|--------------------|-------------|
| `X402_DESTINATION` | Stellar public key (G...) that receives payments |
| `NETWORK`          | `testnet` or `mainnet` |
| `PORT`             | Server port |

## Next steps

- Add more paywalled routes with different `price`/`assetCode` by calling `x402({ ... })` and mounting on another path.
- Use `x402Fetch` from `x402-stellar-sdk/client` in a frontend; provide `payWithStellar` (e.g. Freighter) to handle 402 and retry.
- See [x402-stellar-sdk](https://www.npmjs.com/package/x402-stellar-sdk) README for Hono and Next.js examples.
