"use client";

const QUICK_START = `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const balances = await agent.getBalances();
await agent.sendPayment("G...", "10");
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
await agent.dexSwap(quote);`;

const METHODS = [
  { name: "initialize()", desc: "Call once after construction. Sets up Horizon, DEX, oracle." },
  { name: "getBalances(accountId?)", desc: "Native + trustline balances." },
  { name: "sendPayment(to, amount, assetCode?, assetIssuer?)", desc: "Send XLM or custom asset." },
  { name: "createAccount(destination, startingBalance)", desc: "Create and fund a new account." },
  { name: "pathPayment(sendAsset, sendMax, dest, destAsset, destAmount, path?)", desc: "Path payment strict receive." },
  { name: "dexGetQuote(from, to, amount)", desc: "Swap quote (SoroSwap aggregator)." },
  { name: "dexSwap(quote)", desc: "Execute swap from a quote." },
  { name: "dexSwapExactIn(from, to, amount)", desc: "Quote + execute in one call." },
  { name: "getPrice(asset)", desc: "Reflector oracle price." },
  { name: "lendingSupply(args) / lendingBorrow(args)", desc: "Blend protocol." },
];

export default function AgentKitPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24 }}>
        <a href="/" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>Overview</a>
        <a href="/packages/x402-stellar-sdk" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>x402-stellar-sdk</a>
        <a href="/packages/stellar-agent-kit" style={{ color: "#a78bfa", textDecoration: "none", marginRight: 16 }}>stellar-agent-kit</a>
        <a href="/packages/create-stellar-devkit-app" style={{ color: "#a1a1aa", textDecoration: "none" }}>create-stellar-devkit-app</a>
      </nav>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>stellar-agent-kit</h1>
      <p style={{ color: "#a1a1aa", marginBottom: 24 }}>
        Unified SDK for Stellar: payments, DEX (SoroSwap), lending (Blend), oracles. One class, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>initialize()</code>, then protocol methods. Mainnet only.
      </p>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Quick start</h2>
      <pre style={{ background: "#18181b", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12, marginBottom: 24 }}>
        <code style={{ color: "#a1a1aa" }}>{QUICK_START}</code>
      </pre>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Methods</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {METHODS.map((m) => (
          <li key={m.name} style={{ marginBottom: 10, padding: "10px 12px", background: "#18181b", borderRadius: 8 }}>
            <code style={{ color: "#a78bfa", fontSize: 13 }}>{m.name}</code>
            <span style={{ color: "#a1a1aa", marginLeft: 8, fontSize: 14 }}>{m.desc}</span>
          </li>
        ))}
      </ul>
      <p style={{ color: "#71717a", fontSize: 14, marginTop: 24 }}>
        Install: <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>npm install stellar-agent-kit</code>. Set <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>SECRET_KEY</code> and <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>SOROSWAP_API_KEY</code> for DEX.
      </p>
    </main>
  );
}
