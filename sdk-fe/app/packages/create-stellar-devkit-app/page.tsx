"use client";

const CLI_SNIPPET = `npx create-stellar-devkit-app my-app
# or with template flags:
npx create-stellar-devkit-app my-app --agent-kit
npx create-stellar-devkit-app my-api --x402-api
npx create-stellar-devkit-app my-app --skip-install`;

const TEMPLATES = [
  { name: "Agent Kit", id: "agent-kit", desc: "Next.js app with StellarAgentKit: DEX quote API, swap UI. Set SECRET_KEY and SOROSWAP_API_KEY in .env." },
  { name: "x402 API", id: "x402-api", desc: "Express server with one premium route gated by Stellar payment. Set X402_DESTINATION (your G... address) and NETWORK in .env." },
];

export default function CreateAppPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24 }}>
        <a href="/" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>Overview</a>
        <a href="/packages/x402-stellar-sdk" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>x402-stellar-sdk</a>
        <a href="/packages/stellar-agent-kit" style={{ color: "#a1a1aa", textDecoration: "none", marginRight: 16 }}>stellar-agent-kit</a>
        <a href="/packages/create-stellar-devkit-app" style={{ color: "#a78bfa", textDecoration: "none" }}>create-stellar-devkit-app</a>
      </nav>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>create-stellar-devkit-app</h1>
      <p style={{ color: "#a1a1aa", marginBottom: 24 }}>
        CLI to scaffold Stellar DevKit projects: Agent Kit (Next.js + StellarAgentKit) or x402 API (Express + payment-gated route).
      </p>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Usage</h2>
      <pre style={{ background: "#18181b", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, marginBottom: 24 }}>
        <code style={{ color: "#a1a1aa" }}>{CLI_SNIPPET}</code>
      </pre>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Templates</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {TEMPLATES.map((t) => (
          <li key={t.id} style={{ marginBottom: 12, padding: "14px 16px", background: "#18181b", borderRadius: 8 }}>
            <strong style={{ color: "#e4e4e7" }}>{t.name}</strong>
            <p style={{ color: "#a1a1aa", margin: "6px 0 0", fontSize: 14 }}>{t.desc}</p>
          </li>
        ))}
      </ul>
      <p style={{ color: "#71717a", fontSize: 14, marginTop: 24 }}>
        After scaffold: <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>cd &lt;name&gt;</code>, <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>cp .env.example .env</code>, add your keys, then <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: 4 }}>npm run dev</code>.
      </p>
    </main>
  );
}
