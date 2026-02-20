# x402-stellar-sdk

HTTP 402 Payment Required for Stellar. Monetize APIs by requiring a Stellar payment before serving protected routes. Config-driven (amount, asset, destination, network); works with Hono, Express, and Next.js.

## Install

```bash
npm install x402-stellar-sdk
```

## Server API

### Options (`X402StellarOptions`)

| Field | Type | Description |
|-------|------|--------------|
| `price` | string | Amount (e.g. `"1"`, `"10.5"`) |
| `assetCode` | string | Asset code (e.g. `"XLM"`, `"USDC"`) |
| `issuer` | string? | Issuer account (G...) for custom assets; omit for native XLM |
| `network` | `"mainnet" \| "testnet"` | Stellar network |
| `destination` | string | Destination account (G...) that receives payment |
| `memo` | string? | Optional memo for payment correlation |

### Protect a route (Express)

```typescript
import express from "express";
import { x402 } from "x402-stellar-sdk/server";

const app = express();

const options = {
  price: "1",
  assetCode: "XLM",
  network: "testnet" as const,
  destination: process.env.X402_DESTINATION!, // G...
  memo: "premium-api",
};

app.use("/api/premium", x402(options));
app.get("/api/premium", (_req, res) => {
  res.json({ data: "Premium content – payment verified." });
});

app.listen(3000);
```

### Protect a route (Hono)

```typescript
import { Hono } from "hono";
import { x402Hono } from "x402-stellar-sdk/server/hono";

const app = new Hono();
const options = {
  price: "0.5",
  assetCode: "XLM",
  network: "mainnet" as const,
  destination: process.env.X402_DESTINATION!,
};

app.use("/api/premium", x402Hono(options));
app.get("/api/premium", (c) => c.json({ data: "Premium content" }));
```

### Protect a route (Next.js App Router)

```typescript
// app/api/premium/route.ts
import { withX402 } from "x402-stellar-sdk/server/next";

const options = {
  price: "1",
  assetCode: "XLM",
  network: "testnet" as const,
  destination: process.env.X402_DESTINATION!,
};

export async function GET(req: Request) {
  const res402 = await withX402(req.headers, options);
  if (res402) return res402;
  return Response.json({ data: "Premium content" });
}
```

### Verification

Payment is verified by reading `X-402-Transaction-Hash` from the request and checking the transaction on Horizon: correct destination, amount ≥ `price`, and asset. Optional memo is compared if set. Use `verifyPaymentOnChain(txHash, options)` from `x402-stellar-sdk/server` for custom flows.

## Client API

### `x402Fetch(input, init?, options?)`

Fetches a URL. If the server responds with **402 Payment Required**, the SDK parses payment details from headers (`X-402-Amount`, `X-402-Asset-Code`, `X-402-Network`, `X-402-Destination`, etc.). You must provide `payWithStellar` to perform the payment; then the client retries the request with the transaction hash in `X-402-Transaction-Hash`.

```typescript
import { x402Fetch } from "x402-stellar-sdk/client";
import type { X402PaymentRequest, X402PaymentResponse } from "x402-stellar-sdk/client";

const response = await x402Fetch("https://api.example.com/api/premium", undefined, {
  payWithStellar: async (req: X402PaymentRequest): Promise<X402PaymentResponse | null> => {
    // 1. Show UI (e.g. modal) with req.amount, req.assetCode, req.destination, req.network, req.memo
    // 2. User pays with Freighter or another wallet
    // 3. Return { transactionHash } once the payment tx is submitted
    const txHash = await submitPaymentWithWallet(req);
    return txHash ? { transactionHash: txHash } : null;
  },
});
const data = await response.json();
```

### Using with a payment modal (UI)

In an app that uses the `ui` package (e.g. sdk-fe), you can show a modal with payment instructions and a “Pay with Stellar” action. The modal receives the `X402PaymentRequest` from the 402 response and calls your wallet (e.g. Freighter); on success, pass the transaction hash to `payWithStellar`’s resolution so `x402Fetch` can retry the request. See the `ui` package for an `X402PaymentModal` component that fits this flow.

## Exports

- **Main:** `x402`, `createPaymentRequiredResponse`, `processPaymentMiddleware`, `x402Fetch`, and types.
- **Server:** `x402-stellar-sdk/server` – `x402`, `createPaymentRequiredResponse`, `processPaymentMiddleware`, `verifyPaymentOnChain`, types.
- **Server Hono:** `x402-stellar-sdk/server/hono` – `x402Hono`.
- **Server Next:** `x402-stellar-sdk/server/next` – `withX402`.
- **Client:** `x402-stellar-sdk/client` – `x402Fetch`, `X402PaymentRequest`, `X402PaymentResponse`, `X402ClientOptions`.
