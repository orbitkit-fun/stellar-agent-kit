"use client";

import { useState } from "react";

const PACKAGES = [
  { name: "stellar-agent-kit", desc: "Unified DeFi SDK – StellarAgentKit (DEX swap/quote, config)" },
  { name: "x402-stellar-sdk", desc: "HTTP 402 payment-gated APIs with Stellar payments" },
  { name: "create-stellar-devkit-app", desc: "CLI to scaffold Agent Kit or x402 API apps" },
  { name: "stellar-devkit-mcp", desc: "MCP server for LLM tools and snippets" },
];

const NETWORKS = [
  { name: "testnet", horizon: "https://horizon-testnet.stellar.org", soroban: "https://soroban-testnet.stellar.org" },
  { name: "mainnet", horizon: "https://horizon.stellar.org", soroban: "https://soroban-rpc.mainnet.stellar.gateway.fm" },
];

const SNIPPETS = {
  "Agent Kit": `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);`,
  "x402 Server": `import { x402 } from "x402-stellar-sdk/server";

const options = {
  price: "1",
  assetCode: "XLM",
  network: "testnet" as const,
  destination: process.env.X402_DESTINATION!,
  memo: "premium",
};
app.use("/api/premium", x402(options));
app.get("/api/premium", (_, res) => res.json({ data: "Premium" }));`,
  "x402 Client": `import { x402Fetch } from "x402-stellar-sdk/client";

const res = await x402Fetch(url, undefined, {
  payWithStellar: async (req) => {
    // Send payment to req.destination, req.amount, req.assetCode
    return { transactionHash: "..." };
  },
});
const data = await res.json();`,
};

export default function Home() {
  const [tab, setTab] = useState<keyof typeof SNIPPETS>("Agent Kit");
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24, display: "flex", gap: 16 }}>
        <a href="/" style={{ color: "#a78bfa", textDecoration: "none" }}>Overview</a>
        <a href="/packages/x402-stellar-sdk" style={{ color: "#a1a1aa", textDecoration: "none" }}>x402-stellar-sdk</a>
        <a href="/packages/stellar-agent-kit" style={{ color: "#a1a1aa", textDecoration: "none" }}>stellar-agent-kit</a>
        <a href="/packages/create-stellar-devkit-app" style={{ color: "#a1a1aa", textDecoration: "none" }}>create-stellar-devkit-app</a>
      </nav>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Stellar DevKit</h1>
      <p style={{ color: "#a1a1aa", marginBottom: 32 }}>
        Developer suite for Stellar: Agent Kit SDK, x402 payments, CLI scaffolder, MCP.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Packages</h2>
      <ul style={{ listStyle: "none", padding: 0, marginBottom: 32 }}>
        {PACKAGES.map((p) => (
          <li key={p.name} style={{ marginBottom: 8, padding: "12px 16px", background: "#18181b", borderRadius: 8 }}>
            <a href={"/packages/" + p.name.replace("@", "").replace("/", "-")} style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>{p.name}</a>
            <span style={{ color: "#a1a1aa", marginLeft: 8 }}>{p.desc}</span>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Networks</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32, background: "#18181b", borderRadius: 8, overflow: "hidden" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #27272a" }}>
            <th style={{ textAlign: "left", padding: 12 }}>Network</th>
            <th style={{ textAlign: "left", padding: 12 }}>Horizon</th>
            <th style={{ textAlign: "left", padding: 12 }}>Soroban RPC</th>
          </tr>
        </thead>
        <tbody>
          {NETWORKS.map((n) => (
            <tr key={n.name} style={{ borderBottom: "1px solid #27272a" }}>
              <td style={{ padding: 12 }}>{n.name}</td>
              <td style={{ padding: 12, fontSize: 13, color: "#a1a1aa" }}>{n.horizon}</td>
              <td style={{ padding: 12, fontSize: 13, color: "#a1a1aa" }}>{n.soroban}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Code snippets</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        {(Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              border: "1px solid #3f3f46",
              borderRadius: 6,
              background: tab === t ? "#3f3f46" : "transparent",
              color: "#e4e4e7",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <pre style={{ background: "#18181b", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, margin: 0 }}>
        <code style={{ color: "#a1a1aa" }}>{SNIPPETS[tab]}</code>
      </pre>
    </main>
  );
}
