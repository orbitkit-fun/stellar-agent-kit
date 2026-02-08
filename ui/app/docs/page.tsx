"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"

export default function DocsPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>
      <article className="relative z-20 pt-28 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">Docs</h1>
          <p className="mt-4 text-lg text-zinc-400">
            Stellar Agent Kit — SDK, CLI, MCP, and x402 for Stellar DeFi and AI agents.
          </p>
        </header>

        <nav className="mb-12 flex flex-wrap gap-2 text-sm">
          <a href="#overview" className="text-zinc-400 hover:text-white underline underline-offset-2">
            Overview
          </a>
          <a href="#quick-start" className="text-zinc-400 hover:text-white underline underline-offset-2">
            Quick start
          </a>
          <a href="#packages" className="text-zinc-400 hover:text-white underline underline-offset-2">
            Packages
          </a>
          <a href="#cli" className="text-zinc-400 hover:text-white underline underline-offset-2">
            CLI
          </a>
          <a href="#ui-and-apis" className="text-zinc-400 hover:text-white underline underline-offset-2">
            UI & APIs
          </a>
        </nav>

        <section id="overview" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The Stellar Agent Kit is a developer suite for building on Stellar: swap and send via the
            SoroSwap aggregator (SoroSwap, Phoenix, Aqua), AI agents with tools (balance, swap, quote,
            trustline), MCP for Cursor/Claude, and HTTP 402 payment-gated APIs with Stellar.
          </p>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li>
              <strong className="text-zinc-300">stellar-agent-kit</strong> — Unified SDK: quote, swap, send; config and SoroSwap aggregator.
            </li>
            <li>
              <strong className="text-zinc-300">x402-stellar-sdk</strong> — Monetize APIs with Stellar payments (402 + server/client).
            </li>
            <li>
              <strong className="text-zinc-300">stellar-devkit-mcp</strong> — MCP server for contract IDs and SDK snippets in Cursor.
            </li>
            <li>
              <strong className="text-zinc-300">create-stellar-devkit-app</strong> — CLI to scaffold agent-kit or x402-api apps.
            </li>
          </ul>
        </section>

        <section id="quick-start" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-white mb-4">Quick start</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Install the SDK and run a quote + swap (requires <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">SECRET_KEY</code> and optionally{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">SOROSWAP_API_KEY</code>).
          </p>
          <pre className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300 font-mono overflow-x-auto mb-4">
{`npm install stellar-agent-kit

import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);`}
          </pre>
          <p className="text-zinc-500 text-sm">
            Or scaffold an app: <code className="rounded bg-zinc-800 px-1">npx create-stellar-devkit-app my-app</code>.
          </p>
        </section>

        <section id="packages" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-white mb-4">Packages</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-[#a78bfa] mb-2">stellar-agent-kit</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <code className="rounded bg-zinc-800 px-1">npm install stellar-agent-kit</code>
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                StellarAgentKit(secretKey, network). Call <code className="rounded bg-zinc-800 px-1">initialize()</code> then{" "}
                <code className="rounded bg-zinc-800 px-1">dexGetQuote</code>, <code className="rounded bg-zinc-800 px-1">dexSwap</code>,{" "}
                <code className="rounded bg-zinc-800 px-1">dexSwapExactIn</code>, <code className="rounded bg-zinc-800 px-1">sendPayment</code>. Export{" "}
                <code className="rounded bg-zinc-800 px-1">MAINNET_ASSETS</code>, <code className="rounded bg-zinc-800 px-1">TESTNET_ASSETS</code>,{" "}
                <code className="rounded bg-zinc-800 px-1">getNetworkConfig</code>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#a78bfa] mb-2">x402-stellar-sdk</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <code className="rounded bg-zinc-800 px-1">npm install x402-stellar-sdk</code>
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Server: <code className="rounded bg-zinc-800 px-1">x402</code> middleware (Hono, Next). Client:{" "}
                <code className="rounded bg-zinc-800 px-1">x402Fetch</code> with <code className="rounded bg-zinc-800 px-1">payWithStellar</code> callback.
                See DevKit → Code generator for snippets.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#a78bfa] mb-2">stellar-devkit-mcp</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <code className="rounded bg-zinc-800 px-1">npm install stellar-devkit-mcp</code>
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                MCP server for Cursor/Claude. Tools: <code className="rounded bg-zinc-800 px-1">get_stellar_contract</code> (e.g. SoroSwap mainnet/testnet ID),{" "}
                <code className="rounded bg-zinc-800 px-1">get_sdk_snippet</code> (swap, quote, x402-server, x402-client). Add to Cursor MCP config; use a{" "}
                <strong className="text-zinc-300">new chat</strong> so tools are attached. See DevKit → MCP tab.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#a78bfa] mb-2">create-stellar-devkit-app</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                <code className="rounded bg-zinc-800 px-1">npx create-stellar-devkit-app my-app</code>
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Templates: <strong className="text-zinc-300">agent-kit</strong> (Next.js + stellar-agent-kit, quote route),{" "}
                <strong className="text-zinc-300">x402-api</strong> (Express + x402).
              </p>
            </div>
          </div>
        </section>

        <section id="cli" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-white mb-4">CLI</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            From repo root after <code className="rounded bg-zinc-800 px-1">npm run build:root</code> (or full build):
          </p>
          <ul className="text-zinc-400 space-y-2 text-sm">
            <li>
              <code className="rounded bg-zinc-800 px-1">node dist/index.js balance &lt;G...&gt; [--network=testnet|mainnet]</code> — XLM + trust lines.
            </li>
            <li>
              <code className="rounded bg-zinc-800 px-1">node dist/index.js pay &lt;S...&gt; &lt;G...&gt; &lt;amount&gt; [--network] [--asset] [--issuer]</code> — Send XLM or custom asset.
            </li>
            <li>
              <code className="rounded bg-zinc-800 px-1">node dist/index.js agent [--api-key &lt;key&gt;]</code> — Interactive chat with tools (check_balance, swap_asset, get_swap_quote, create_trustline). Uses <code className="rounded bg-zinc-800 px-1">GROQ_API_KEY</code> or OpenAI-compatible API.
            </li>
          </ul>
        </section>

        <section id="ui-and-apis" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-white mb-4">UI & APIs</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            This app (Warly) provides Swap and Send with Freighter; no secret key in the browser. Backend builds transactions; you sign in the wallet.
          </p>
          <p className="text-zinc-400 text-sm mb-2 font-medium text-zinc-300">API routes</p>
          <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside mb-4">
            <li>POST <code className="rounded bg-zinc-800 px-1">/api/swap/quote</code> — Get quote (from, to, amount, network).</li>
            <li>POST <code className="rounded bg-zinc-800 px-1">/api/swap/build</code> — Build swap transaction.</li>
            <li>POST <code className="rounded bg-zinc-800 px-1">/api/swap/submit</code> — Submit signed transaction.</li>
            <li>POST <code className="rounded bg-zinc-800 px-1">/api/send/build</code> — Build payment transaction.</li>
            <li>POST <code className="rounded bg-zinc-800 px-1">/api/send/submit</code> — Submit signed payment.</li>
            <li>GET <code className="rounded bg-zinc-800 px-1">/api/balance?address=...&network=...</code> — Account balances.</li>
            <li>GET <code className="rounded bg-zinc-800 px-1">/api/v1/validate?appId=...</code> — DevKit project validation (valid only for appIds registered when creating a project).</li>
          </ul>
          <p className="text-zinc-400 text-sm">
            DevKit page: create a project (APP Id, API endpoint), browse Protocols, copy code from Code generator, and set up MCP. See{" "}
            <Link href="/devkit" className="text-[#a78bfa] hover:underline">DevKit</Link>.
          </p>
        </section>

        <section className="border-t border-zinc-800 pt-8">
          <p className="text-zinc-500 text-sm">
            For full feature list and testing checklist, see <code className="rounded bg-zinc-800 px-1">FEATURES.md</code> and{" "}
            <code className="rounded bg-zinc-800 px-1">FUNCTIONALITY_CHECK_AND_PRESENTATION.md</code> in the repo.
          </p>
        </section>
      </article>
      </PageTransition>
    </main>
  )
}
