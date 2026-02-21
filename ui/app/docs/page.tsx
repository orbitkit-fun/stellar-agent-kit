"use client"

import Link from "next/link"
import { BookOpen, Key, Box, Terminal, Bot, Network } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { DocsSidebar } from "@/components/docs-sidebar"
import { DocsAssistant } from "@/components/docs-assistant"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"

export default function DocsPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <PageTransition>
        <div className="relative z-20 flex min-h-screen pt-0 pb-8 items-stretch bg-black">
          <DocsSidebar />
          <article className="flex-1 min-w-0 pt-28 px-6 md:px-8 lg:px-10 xl:px-12 pb-24 bg-black">
            <span className="text-[#a78bfa] text-sm font-medium">Introduction</span>
            <header className="mb-10 mt-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Stellar DevKit documentation
              </h1>
              <p className="mt-4 text-lg text-zinc-400">
                SDK, CLI, MCP, and x402 — in-depth reference with code snippets.
              </p>
            </header>

          {/* ─── Guide cards (Bento grid: left/middle tall, right half-height) ─ */}
          <section className="mb-14">
            <h2 className="sr-only">Documentation guide</h2>
            <BentoGrid className="lg:grid-rows-3">
              <BentoCard
                Icon={Box}
                name="Agent Kit — DeFi"
                description="Unified SDK for payments, DEX swaps, lending, and oracles on Stellar."
                href="#stellar-agent-kit"
                cta="Learn more"
                background={<img className="absolute -top-20 -right-20 opacity-60" />}
                className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
              />
              <BentoCard
                Icon={BookOpen}
                name="Getting Started"
                description="Set up the SDK and run your first swap or payment on Stellar."
                href="#getting-started"
                cta="Learn more"
                background={<img className="absolute -top-20 -right-20 opacity-60" />}
                className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
              />
              <BentoCard
                Icon={Key}
                name="x402 — Paid API"
                description="Learn how to set up x402 and create your first paid API endpoint with Stellar."
                href="#x402-stellar-sdk"
                cta="Learn more"
                background={<img className="absolute -top-20 -right-20 opacity-60" />}
                className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
              />
              <BentoCard
                Icon={Bot}
                name="MCP"
                description="MCP server for Cursor/Claude: contract IDs and SDK snippets on demand."
                href="#stellar-devkit-mcp"
                cta="Learn more"
                background={<img className="absolute -top-20 -right-20 opacity-60" />}
                className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
              />
              <BentoCard
                Icon={Terminal}
                name="CLI & Scaffolding"
                description="Scaffold Agent Kit or x402 API apps in one command."
                href="#create-stellar-devkit-app"
                cta="Learn more"
                background={<img className="absolute -top-20 -right-20 opacity-60" />}
                className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
              />
            </BentoGrid>
          </section>

          {/* ─── Overview ───────────────────────────────────────────────── */}
          <section id="overview" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              The Stellar DevKit is a developer suite for building on Stellar: DEX swaps (SoroSwap aggregator), payments, path payments, lending (Blend), oracles (Reflector), AI agents with tools, MCP for Cursor/Claude, and HTTP 402 payment-gated APIs.
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
              <li><strong className="text-zinc-300">stellar-agent-kit</strong> — Unified SDK: getBalances, sendPayment, createAccount, pathPayment, dexGetQuote, dexSwap, getPrice, lendingSupply/lendingBorrow.</li>
              <li><strong className="text-zinc-300">x402-stellar-sdk</strong> — Monetize APIs with Stellar payments: server middleware (Express/Hono/Next) and client x402Fetch with payWithStellar.</li>
              <li><strong className="text-zinc-300">stellar-devkit-mcp</strong> — MCP server: get_stellar_contract, get_sdk_snippet, get_quote, list_devkit_methods.</li>
              <li><strong className="text-zinc-300">create-stellar-devkit-app</strong> — CLI to scaffold agent-kit (Next.js + StellarAgentKit) or x402-api (Express + paywall).</li>
            </ul>
            <p className="text-zinc-500 text-sm">
              Network: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">mainnet</code> only for stellar-agent-kit DEX/lending. x402 supports <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">testnet</code> and <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">mainnet</code>.
            </p>

            <h3 className="text-lg font-semibold text-white mt-8 mb-3">Package Summary</h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Package</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Description</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Install</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">x402-stellar-sdk</td><td className="p-3">HTTP 402 payment middleware for monetizing APIs with Stellar</td><td className="p-3">npm i x402-stellar-sdk</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">stellar-agent-kit</td><td className="p-3">Unified DeFi SDK: payments, DEX, lending, oracles</td><td className="p-3">npm i stellar-agent-kit</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">create-stellar-devkit-app</td><td className="p-3">CLI to scaffold Agent Kit or x402 API apps</td><td className="p-3">npx create-stellar-devkit-app</td></tr>
                  <tr><td className="p-3 font-mono">stellar-devkit-mcp</td><td className="p-3">MCP server for Cursor/Claude integration</td><td className="p-3">See docs</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Getting Started ─────────────────────────────────────────── */}
          <section id="getting-started" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Getting Started</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Install the SDK, set environment variables, then create an agent and call <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">initialize()</code> before any protocol method. Or scaffold an app with the CLI.
            </p>
          </section>

          {/* ─── Quick start ────────────────────────────────────────────── */}
          <section id="quick-start" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Quick start</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Install the SDK, set env vars, then create an agent and call <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">initialize()</code> before any protocol method.
            </p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`npm install stellar-agent-kit`}
            </pre>
            <p className="text-zinc-500 text-sm mb-2">Required env (e.g. in <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">.env</code>):</p>
            <ul className="text-zinc-500 text-sm list-disc list-inside mb-4">
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">SECRET_KEY</code> — Stellar secret key (S...). Keep server-side only.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">SOROSWAP_API_KEY</code> — Required for DEX quotes (get from SoroSwap aggregator).</li>
            </ul>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Get a swap quote (1 XLM → USDC, 7 decimals)
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);`}
            </pre>
            <p className="text-zinc-500 text-sm">
              Or scaffold an app: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npx create-stellar-devkit-app my-app</code> and choose agent-kit or x402-api.
            </p>
          </section>

          {/* ─── stellar-agent-kit ──────────────────────────────────────── */}
          <section id="stellar-agent-kit" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">stellar-agent-kit</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm install stellar-agent-kit</code>. One class <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">StellarAgentKit(secretKey, network)</code>; call <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">await agent.initialize()</code> once, then use methods below.
            </p>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Supported Protocols</h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Protocol</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Network</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">SoroSwap Finance</td><td className="p-3">mainnet</td><td className="p-3">First DEX aggregator: optimal swaps, liquidity, TVL leaderboards</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Blend</td><td className="p-3">mainnet</td><td className="p-3">Lending primitive: customizable pools, supply/borrow</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Allbridge Core</td><td className="p-3">mainnet</td><td className="p-3">Cross-chain bridge to 10+ networks; use Allbridge SDK</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">FxDAO</td><td className="p-3">mainnet</td><td className="p-3">Synthetic stablecoins (USDx, EURx, GBPx), vaults, TVL rankings</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Phoenix</td><td className="p-3">mainnet</td><td className="p-3">AMM pools (via SoroSwap aggregator)</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Reflector</td><td className="p-3">mainnet</td><td className="p-3">Price oracles (SEP-40)</td></tr>
                  <tr><td className="p-3 font-mono">Stellar Core</td><td className="p-3">mainnet/testnet</td><td className="p-3">Payments, path payments, create account</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">getBalances(accountId?)</h3>
            <p className="text-zinc-400 text-sm mb-2">Native + trustline balances. Omit <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">accountId</code> to use the agent&apos;s public key.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`const balances = await agent.getBalances();
// or: await agent.getBalances("G...");
// → [{ assetCode: "XLM", balance: "100.5", issuer?: string, limit?: string }, ...]`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">sendPayment(to, amount, assetCode?, assetIssuer?)</h3>
            <p className="text-zinc-400 text-sm mb-2">Send XLM or custom asset. Omit asset for native XLM.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`await agent.sendPayment("G...", "10");
await agent.sendPayment("G...", "5", "USDC", "G...");  // custom asset
// → { hash: "..." }`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">createAccount(destination, startingBalance)</h3>
            <p className="text-zinc-400 text-sm mb-2">Create and fund a new account (minimum ~1 XLM for base reserve).</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`await agent.createAccount("G...", "1");
// → { hash: "..." }`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">pathPayment(sendAsset, sendMax, destination, destAsset, destAmount, path?)</h3>
            <p className="text-zinc-400 text-sm mb-2">Path payment strict receive: send up to <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">sendMax</code> of sendAsset so destination receives exactly <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">destAmount</code> of destAsset.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`await agent.pathPayment(
  { assetCode: "XLM" },           // send asset
  "10",                           // sendMax
  "G...",                         // destination
  { assetCode: "USDC", issuer: "G..." },  // dest asset
  "5",                            // destAmount
  []                              // optional path
);
// → { hash: "..." }`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">dexGetQuote(fromAsset, toAsset, amount) / dexSwap(quote) / dexSwapExactIn(...)</h3>
            <p className="text-zinc-400 text-sm mb-2">SoroSwap aggregator. Amount in smallest units (e.g. 7 decimals for XLM).</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"  // 1 XLM
);
await agent.dexSwap(quote);

// Or one-shot:
await agent.dexSwapExactIn(fromAsset, toAsset, amount);`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">getPrice(asset)</h3>
            <p className="text-zinc-400 text-sm mb-2">Reflector oracle. Asset: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">{`{ symbol: "XLM" }`}</code> or <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">{`{ contractId: "C..." }`}</code>.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`const price = await agent.getPrice({ symbol: "XLM" });
// → PriceData`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">lendingSupply(args) / lendingBorrow(args)</h3>
            <p className="text-zinc-400 text-sm mb-2">Blend protocol. See exported types <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">LendingSupplyArgs</code>, <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">LendingBorrowArgs</code>.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`await agent.lendingSupply({ ... });
await agent.lendingBorrow({ ... });`}
            </pre>
          </section>

          {/* ─── x402-stellar-sdk ───────────────────────────────────────── */}
          <section id="x402-stellar-sdk" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">x402-stellar-sdk</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm install x402-stellar-sdk</code>. Protect routes with a Stellar payment; client detects 402 and can retry with <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">payWithStellar</code>.
            </p>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Features</h3>
            <ul className="text-zinc-400 text-sm list-disc list-inside space-y-1 mb-4">
              <li>Paywall middleware: return HTTP 402 with payment details (amount, asset, destination, network).</li>
              <li>Server integrations: Express, Hono, Next.js App Router.</li>
              <li>Client <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">x402Fetch</code>: on 402, calls <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">payWithStellar</code>, retries with <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">X-402-Transaction-Hash</code>.</li>
              <li>Horizon-based verification of payment before serving content.</li>
              <li>Supports mainnet and testnet; native XLM or custom assets (e.g. USDC).</li>
            </ul>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Server options (X402StellarOptions)</h3>
            <ul className="text-zinc-400 text-sm list-disc list-inside mb-4">
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">price</code> — Amount string (e.g. &quot;1&quot;, &quot;10.5&quot;)</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">assetCode</code> — e.g. &quot;XLM&quot;, &quot;USDC&quot;</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">issuer?</code> — For custom assets; omit for native XLM</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">network</code> — &quot;mainnet&quot; | &quot;testnet&quot;</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">destination</code> — Stellar account (G...) that receives payment</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">memo?</code> — Optional memo for correlation</li>
            </ul>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Express</h3>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`import express from "express";
import { x402 } from "x402-stellar-sdk/server";

const app = express();
const options = {
  price: "1",
  assetCode: "XLM",
  network: "testnet",
  destination: process.env.X402_DESTINATION!,
  memo: "premium-api",
};
app.use("/api/premium", x402(options));
app.get("/api/premium", (_, res) => res.json({ data: "Premium content" }));
app.listen(3000);`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Hono</h3>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`import { Hono } from "hono";
import { x402Hono } from "x402-stellar-sdk/server/hono";

const app = new Hono();
app.use("/api/premium", x402Hono(options));
app.get("/api/premium", (c) => c.json({ data: "Premium content" }));`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Next.js App Router</h3>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`// app/api/premium/route.ts
import { withX402 } from "x402-stellar-sdk/server/next";

export async function GET(req: Request) {
  const res402 = await withX402(req.headers, options);
  if (res402) return res402;
  return Response.json({ data: "Premium content" });
}`}
            </pre>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Client: x402Fetch</h3>
            <p className="text-zinc-400 text-sm mb-2">On 402, the client must provide <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">payWithStellar</code> to perform the payment and return the transaction hash; then the request is retried with <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">X-402-Transaction-Hash</code>.</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`import { x402Fetch } from "x402-stellar-sdk/client";
import type { X402PaymentRequest, X402PaymentResponse } from "x402-stellar-sdk/client";

const res = await x402Fetch(url, undefined, {
  payWithStellar: async (req: X402PaymentRequest): Promise<X402PaymentResponse | null> => {
    // req: amount, assetCode, network, destination, memo?
    // Submit payment (e.g. Freighter), then:
    return { transactionHash: txHash };
  },
});
const data = await res.json();`}
            </pre>
          </section>

          {/* ─── create-stellar-devkit-app ──────────────────────────────── */}
          <section id="create-stellar-devkit-app" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">create-stellar-devkit-app</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npx create-stellar-devkit-app [name]</code>. Prompts for project name and template if not provided.
            </p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`npx create-stellar-devkit-app my-app
npx create-stellar-devkit-app my-app --agent-kit
npx create-stellar-devkit-app my-api --x402-api
npx create-stellar-devkit-app my-app --skip-install`}
            </pre>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Templates</h3>
            <ul className="text-zinc-400 text-sm space-y-2 mb-4">
              <li><strong className="text-zinc-300">agent-kit</strong> — Next.js app with stellar-agent-kit: quote API route, swap UI. Env: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">SECRET_KEY</code>, <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">SOROSWAP_API_KEY</code>.</li>
              <li><strong className="text-zinc-300">x402-api</strong> — Express server with one premium route. Env: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">X402_DESTINATION</code> (your G...), <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">NETWORK</code> (testnet|mainnet).</li>
            </ul>
          </section>

          {/* ─── stellar-devkit-mcp ─────────────────────────────────────── */}
          <section id="stellar-devkit-mcp" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">stellar-devkit-mcp</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm install stellar-devkit-mcp</code>. MCP server for Cursor/Claude: tools and resources for Stellar contracts and SDK snippets.
            </p>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Tools</h3>
            <ul className="text-zinc-400 text-sm space-y-2 mb-4">
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">get_stellar_contract</code> — protocol (e.g. soroswap), network (mainnet). Returns contract ID.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">get_sdk_snippet</code> — operation: swap, quote, x402-server, x402-client, get-balances, send-payment, create-account, path-payment. Returns copy-paste code.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">get_quote</code> — fromAsset, toAsset, amount. Live quote (requires SOROSWAP_API_KEY where MCP runs).</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">list_devkit_methods</code> — Lists StellarAgentKit and x402-stellar-sdk public APIs.</li>
            </ul>
            <p className="text-zinc-400 text-sm mb-2">Add to Cursor MCP config; use a new chat so tools are attached. See <Link href="/devkit" className="text-[#a78bfa] hover:underline">DevKit</Link> → MCP tab.</p>
          </section>

          {/* ─── CLI ────────────────────────────────────────────────────── */}
          <section id="cli" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">CLI</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              From repo root after <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run build:root</code> (or full build). Commands live in <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">src/</code> and are run via <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">node dist/index.js &lt;command&gt;</code>.
            </p>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">balance</h3>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`node dist/index.js balance GABC... [--network=testnet|mainnet]
# Output: JSON array of { code, issuer, balance }`}
            </pre>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">pay</h3>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`node dist/index.js pay <SECRET_KEY> <DESTINATION_G...> <amount> [--network=mainnet] [--asset=USDC] [--issuer=G...]`}
            </pre>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">agent</h3>
            <p className="text-zinc-400 text-sm mb-2">Interactive chat with tools: check_balance, swap_asset, get_swap_quote, create_trustline. Uses <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">GROQ_API_KEY</code> or <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">--api-key</code> (OpenAI-compatible).</p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-4 whitespace-pre leading-relaxed">
{`node dist/index.js agent [--api-key <key>]
# At prompt: "What's the balance of G...?" or "Get a quote to swap 10 XLM to USDC"`}
            </pre>
          </section>

          {/* ─── UI & APIs ──────────────────────────────────────────────── */}
          <section id="ui-and-apis" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">UI & APIs</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              This app (Orbit) provides Swap and Send with Freighter; the backend builds transactions and you sign in the wallet. No secret key in the browser.
            </p>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Swap</h3>
            <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside mb-4">
              <li>POST <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/swap/quote</code> — Body: from, to, amount, network. Returns quote.</li>
              <li>POST <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/swap/build</code> — Build swap transaction.</li>
              <li>POST <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/swap/submit</code> — Submit signed transaction.</li>
            </ul>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Send</h3>
            <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside mb-4">
              <li>POST <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/send/build</code> — Build payment transaction.</li>
              <li>POST <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/send/submit</code> — Submit signed payment.</li>
            </ul>
            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Other</h3>
            <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside mb-4">
              <li>GET <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/balance?address=...&network=...</code> — Account balances.</li>
              <li>GET <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/price</code> — Price endpoint (if implemented).</li>
              <li>GET <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">/api/v1/validate?appId=...</code> — DevKit project validation.</li>
            </ul>
            <p className="text-zinc-400 text-sm">
              <Link href="/devkit" className="text-[#a78bfa] hover:underline">DevKit</Link>: create project (APP Id, API endpoint), Protocols, Code generator, MCP tab.
            </p>
          </section>

          {/* ─── Env reference ──────────────────────────────────────────── */}
          <section id="env-reference" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Environment reference</h2>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Variable</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Where</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">SECRET_KEY</td><td className="p-3">stellar-agent-kit, CLI, agent-kit template</td><td className="p-3">Stellar secret key (S...). Server-side only.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">SOROSWAP_API_KEY</td><td className="p-3">stellar-agent-kit, agent-kit template, MCP get_quote</td><td className="p-3">Required for DEX quotes.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">X402_DESTINATION</td><td className="p-3">x402-api template, x402 server</td><td className="p-3">Stellar account (G...) that receives payments.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">NETWORK</td><td className="p-3">x402-api template</td><td className="p-3">testnet | mainnet.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">DODO_PAYMENTS_API_KEY</td><td className="p-3">ui (Pricing)</td><td className="p-3">Dodo Payments API key (Bearer). From Dashboard → Developer → API Keys.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">DODO_PAYMENTS_WEBHOOK_SECRET</td><td className="p-3">ui (Pricing webhook)</td><td className="p-3">Webhook signing secret for payment.succeeded. From Settings → Webhooks.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">DODO_PAYMENTS_PRODUCT_BUILDER</td><td className="p-3">ui (Pricing)</td><td className="p-3">Dodo product ID for Builder plan (create one-time product in dashboard).</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">DODO_PAYMENTS_PRODUCT_PRO</td><td className="p-3">ui (Pricing)</td><td className="p-3">Dodo product ID for Pro plan (create one-time product in dashboard).</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">DODO_PAYMENTS_ENVIRONMENT</td><td className="p-3">ui (Pricing)</td><td className="p-3">Optional: <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">test_mode</code> or <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">live_mode</code>. Default: test_mode.</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">GROQ_API_KEY</td><td className="p-3">CLI agent, Docs assistant</td><td className="p-3">Or OPENAI_API_KEY for docs assistant; CLI can use --api-key.</td></tr>
                  <tr><td className="p-3 font-mono">OPENAI_API_KEY</td><td className="p-3">Docs assistant</td><td className="p-3">Optional; used if GROQ_API_KEY is not set.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Networks & Contracts ────────────────────────────────────── */}
          <section id="networks-and-contracts" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Networks &amp; Contracts</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Stellar mainnet and testnet endpoints used by the DevKit. Contract and asset IDs are for mainnet unless noted.
            </p>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Networks</h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Network</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Horizon</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Soroban RPC</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Explorer</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <td className="p-3 font-mono">mainnet</td>
                    <td className="p-3 font-mono text-xs">https://horizon.stellar.org</td>
                    <td className="p-3 font-mono text-xs">https://rpc.mainnet.stellar.org</td>
                    <td className="p-3">stellar.expert / stellar.org</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">testnet</td>
                    <td className="p-3 font-mono text-xs">https://horizon-testnet.stellar.org</td>
                    <td className="p-3 font-mono text-xs">https://soroban-testnet.stellar.org</td>
                    <td className="p-3">stellar.expert (testnet)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Contract addresses (mainnet)</h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Contract</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Contract ID</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">SoroSwap aggregator</td><td className="p-3 font-mono text-xs break-all">CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Blend (pools)</td><td className="p-3 font-mono text-xs break-all">CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">FxDAO (Vaults)</td><td className="p-3 font-mono text-xs break-all">CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">FxDAO (Locking Pool)</td><td className="p-3 font-mono text-xs break-all">CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Allbridge Core</td><td className="p-3 text-xs">SDK: docs-core.allbridge.io/sdk/guides/stellar</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Reflector (dex)</td><td className="p-3 font-mono text-xs break-all">CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M</td></tr>
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">Reflector (cexDex)</td><td className="p-3 font-mono text-xs break-all">CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN</td></tr>
                  <tr><td className="p-3 font-mono">Reflector (fiat)</td><td className="p-3 font-mono text-xs break-all">CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[#a78bfa] mt-6 mb-2">Token / asset addresses (mainnet)</h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left p-3 text-zinc-300 font-medium">Asset</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Contract ID (Soroban)</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800"><td className="p-3 font-mono">XLM</td><td className="p-3 font-mono text-xs break-all">CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA</td></tr>
                  <tr><td className="p-3 font-mono">USDC</td><td className="p-3 font-mono text-xs break-all">CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-sm">Use <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">MAINNET_ASSETS</code> from <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">stellar-agent-kit</code> in code.</p>
          </section>

          {/* ─── Project structure ──────────────────────────────────────── */}
          <section id="project-structure" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Project structure</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Monorepo layout. Packages are under <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">packages/</code>; UI and SDK frontend under <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">ui/</code> and <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">sdk-fe/</code>.
            </p>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200 font-mono overflow-x-auto whitespace-pre leading-relaxed">
{`stellar-agent-kit/
├── packages/
│   ├── x402-stellar-sdk/     # HTTP 402 server + client
│   ├── stellar-agent-kit/    # DeFi SDK (DEX, lending, oracles)
│   ├── create-stellar-devkit-app/  # CLI + templates
│   └── stellar-devkit-mcp/   # MCP server
├── ui/                       # Next.js app (Orbit)
├── sdk-fe/                   # SDK docs / package pages
└── docs/                     # REFERENCE_MANTLE_DEVKIT, etc.`}
            </pre>
          </section>

          {/* ─── Development ────────────────────────────────────────────── */}
          <section id="development" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Development</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              From the repo root. Use <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run build:root</code> or full build before running CLI or MCP.
            </p>
            <ul className="text-zinc-400 text-sm space-y-2 list-disc list-inside mb-4">
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm install</code> — Install dependencies (root + workspaces).</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run build</code> / <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run build:root</code> — Build packages and CLI.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run typecheck</code> — TypeScript check.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run lint</code> — Lint.</li>
              <li><code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">npm run dev</code> — Run UI dev server (e.g. <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">ui/</code> or root script).</li>
            </ul>
          </section>

          {/* ─── Links ─────────────────────────────────────────────────── */}
          <section id="links" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4">Links</h2>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li><Link href="/docs" className="text-[#a78bfa] hover:underline">Docs</Link> — This documentation.</li>
              <li><Link href="/devkit" className="text-[#a78bfa] hover:underline">DevKit</Link> — Create project, Protocols, Code generator, MCP.</li>
              <li><Link href="/swap" className="text-[#a78bfa] hover:underline">Try Swap</Link> — Swap UI with Freighter.</li>
              <li><Link href="/pricing" className="text-[#a78bfa] hover:underline">Pricing</Link> — Plans and Dodo Payments.</li>
              <li>Stellar docs: <a href="https://developers.stellar.org" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:underline">developers.stellar.org</a>.</li>
              <li>Explorer: <a href="https://stellar.expert" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:underline">stellar.expert</a>.</li>
            </ul>
          </section>

          <section className="border-t border-zinc-800 pt-8">
            <p className="text-zinc-500 text-sm">
              Pricing and access gating: see <Link href="/pricing" className="text-[#a78bfa] hover:underline">Pricing</Link>. For repo features and testing, see <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">FLOWCHART.md</code> and <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-zinc-200 font-mono text-[0.9em]">docs/REFERENCE_MANTLE_DEVKIT.md</code>.
            </p>
          </section>
        </article>
        <aside className="w-96 min-w-80 max-w-[24rem] shrink-0 hidden lg:flex flex-col h-screen sticky top-0 pt-14 border-l border-zinc-800 bg-black">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <DocsAssistant />
          </div>
        </aside>
      </div>
      </PageTransition>
    </main>
  )
}
