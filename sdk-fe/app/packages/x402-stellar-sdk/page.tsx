"use client";

const SERVER_SNIPPET = `import express from "express";
import { x402 } from "x402-stellar-sdk/server";

const app = express();
const options = {
  price: "1",
  assetCode: "XLM",
  network: "testnet" as const,
  destination: process.env.X402_DESTINATION!,
  memo: "premium-api",
};
app.use("/api/premium", x402(options));
app.get("/api/premium", (_req, res) =>
  res.json({ data: "Premium content – payment verified." })
);
app.listen(3000);`;

const CLIENT_SNIPPET = `import { x402Fetch } from "x402-stellar-sdk/client";
import type { X402PaymentRequest, X402PaymentResponse } from "x402-stellar-sdk/client";

const res = await x402Fetch("https://api.example.com/api/premium", undefined, {
  payWithStellar: async (req: X402PaymentRequest): Promise<X402PaymentResponse | null> => {
    // Show UI (e.g. modal) with req.amount, req.assetCode, req.destination; submit via wallet
    const txHash = await submitPaymentWithWallet(req);
    return txHash ? { transactionHash: txHash } : null;
  },
});
const data = await res.json();`;

export default function X402Page() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24 }}>
        <a href="/" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>Overview</a>
        <a href="/packages/x402-stellar-sdk" style={{ color: "#a78bfa", textDecoration: "none", marginRight: 16 }}>x402-stellar-sdk</a>
        <a href="/packages/stellar-agent-kit" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>stellar-agent-kit</a>
        <a href="/packages/create-stellar-devkit-app" style={{ color: "#a1a1aa", textDecoration: "none" }}>create-stellar-devkit-app</a>
      </nav>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>x402-stellar-sdk</h1>
      <p style={{ color: "#a1a1aa", marginBottom: 24 }}>
        HTTP 402 Payment Required for Stellar. Protect routes with config-driven paywalls; verify payments on Horizon. Use with Express, Hono, or Next.js.
      </p>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Server – protect a route (Express)</h2>
      <pre style={{ background: "#18181b", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12, marginBottom: 24 }}>
        <code style={{ color: "#a1a1aa" }}>{SERVER_SNIPPET}</code>
      </pre>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Client – handle 402 and retry with payment</h2>
      <pre style={{ background: "#18181b", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12 }}>
        <code style={{ color: "#a1a1aa" }}>{CLIENT_SNIPPET}</code>
      </pre>
      <p style={{ color: "#71717a", fontSize: 14 }}>
        Options: <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>price</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>assetCode</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>issuer?</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>network</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>destination</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>memo?</code>. Install: <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>npm install x402-stellar-sdk</code>.
      </p>
    </main>
  );
}
