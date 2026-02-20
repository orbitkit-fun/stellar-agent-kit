"use client"

import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { CircleArrowRight, ArrowRight, Code2, Wallet, Zap, Bot } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const linesOpacity = 1 - scrollProgress
  const linesScale = 1 - scrollProgress * 0.3

  const scrollToCapabilities = () => {
    document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>
      <div
        className="fixed inset-0 z-0 w-screen h-screen pointer-events-none transition-all duration-100"
        style={{ opacity: linesOpacity, transform: `scale(${linesScale})` }}
      >
        <div className="bg-lines-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2269"
            height="2108"
            viewBox="0 0 2269 2108"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29" stroke="#4C00EC" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="100px 99999px" className="animate-line-race-1" />
            <path d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106" stroke="#4C00EC" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="100px 99999px" className="animate-line-race-2" />
            <path d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106" stroke="#4C00EC" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="100px 99999px" className="animate-line-race-3" />
            <path d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29" stroke="#4C00EC" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="100px 99999px" className="animate-line-race-4" />
            <path opacity="0.2" d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106" stroke="white" strokeWidth="1" strokeMiterlimit="10" />
            <path opacity="0.2" d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29" stroke="white" strokeWidth="1" strokeMiterlimit="10" />
            <path opacity="0.2" d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29" stroke="white" strokeWidth="1" strokeMiterlimit="10" />
            <path opacity="0.2" d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106" stroke="white" strokeWidth="1" strokeMiterlimit="10" />
          </svg>
        </div>
      </div>

      {/* Hero — centered, large (majority of viewport) */}
      <div id="hero" className="relative z-20 container mx-auto px-6 lg:px-12 pt-32 pb-40 min-h-[85vh] flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center max-w-3xl mx-auto w-full">
          <div className="mb-10 md:mb-14 animate-fade-in">
            <Image
              src="/stellar-logo.png"
              alt="Stellar"
              width={300}
              height={77}
              className="h-14 w-auto sm:h-16 md:h-20 lg:h-24 xl:h-28 object-contain object-center"
              priority
            />
          </div>
          <p
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-zinc-400 mb-12 md:mb-14 animate-fade-in-up animation-delay-200 font-semibold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            The developer suite for building on Stellar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-400">
            <button
              type="button"
              onClick={scrollToCapabilities}
              className="group inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              See what’s included
              <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-300"
            >
              Docs
            </Link>
            <Link
              href="/swap"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-300"
            >
              Try Swap
            </Link>
            <Link
              href="https://www.npmjs.com/~milan4606"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-300"
            >
              npm
            </Link>
          </div>
        </div>
      </div>

      {/* What's in the DevKit — four pillars */}
      <section id="capabilities" className="relative z-20 py-20 scroll-mt-24">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-balance">What’s in the DevKit</h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-2xl">
            Four npm packages and this dashboard. Use the SDK in Node or the browser; add MCP to Cursor for AI-assisted Stellar development.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            <Link
              href="/docs#stellar-agent-kit"
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-[#5100fd]/50 hover:bg-zinc-900/70 transition-all duration-300"
            >
              <Code2 className="h-8 w-8 text-[#a78bfa] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">stellar-agent-kit</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Unified SDK: getBalances, sendPayment, createAccount, pathPayment, DEX quotes &amp; swaps (SoroSwap), lending (Blend), oracles (Reflector).
              </p>
              <span className="inline-flex items-center mt-4 text-sm text-[#a78bfa] group-hover:underline">
                Docs <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/docs#x402-stellar-sdk"
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-[#5100fd]/50 hover:bg-zinc-900/70 transition-all duration-300"
            >
              <Wallet className="h-8 w-8 text-[#a78bfa] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">x402-stellar-sdk</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Monetize APIs with Stellar. HTTP 402 middleware (Express, Hono, Next.js) and client x402Fetch with payWithStellar.
              </p>
              <span className="inline-flex items-center mt-4 text-sm text-[#a78bfa] group-hover:underline">
                Docs <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/docs#create-stellar-devkit-app"
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-[#5100fd]/50 hover:bg-zinc-900/70 transition-all duration-300"
            >
              <Zap className="h-8 w-8 text-[#a78bfa] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">create-stellar-devkit-app</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Scaffold in one command. Agent Kit (Next.js + StellarAgentKit) or x402 API (Express + paywall). Copy .env and run.
              </p>
              <span className="inline-flex items-center mt-4 text-sm text-[#a78bfa] group-hover:underline">
                Docs <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/devkit"
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-[#5100fd]/50 hover:bg-zinc-900/70 transition-all duration-300"
            >
              <Bot className="h-8 w-8 text-[#a78bfa] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">stellar-devkit-mcp</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                MCP server for Cursor/Claude. Contract IDs, SDK snippets, live quotes. Attach to a chat and ask for code or addresses.
              </p>
              <span className="inline-flex items-center mt-4 text-sm text-[#a78bfa] group-hover:underline">
                Open DevKit <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          <h2 className="text-2xl md:text-3xl font-light mb-6">Capabilities</h2>
          <p className="text-zinc-400 mb-8 max-w-xl">
            Use the CLI agent (balance, pay, chat with tools) or build your own flow with the SDK. Swap and Send in the browser with Freighter—no secret key in the client.
          </p>

          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 mb-8 rounded-full">
              <TabsTrigger value="tools" className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-8 py-3 rounded-full transition-all">
                Agent tools
              </TabsTrigger>
              <TabsTrigger value="flow" className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-8 py-3 rounded-full transition-all">
                How it works
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Check balance</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Get native + trustline balances for any Stellar account via Horizon. Use <code className="rounded bg-zinc-800 px-1 text-xs">agent.getBalances()</code> or the CLI.</p>
                    <Link href="/docs#stellar-agent-kit" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Docs</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Swap assets</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">DEX swaps via SoroSwap aggregator. Quote then execute with <code className="rounded bg-zinc-800 px-1 text-xs">dexGetQuote</code> + <code className="rounded bg-zinc-800 px-1 text-xs">dexSwap</code>, or try the in-browser Swap with Freighter.</p>
                    <Link href="/swap" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Try Swap</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Payments &amp; path payments</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Send XLM or custom assets; create accounts; path payments (strict receive). All via <code className="rounded bg-zinc-800 px-1 text-xs">StellarAgentKit</code> or the CLI <code className="rounded bg-zinc-800 px-1 text-xs">pay</code> command.</p>
                    <Link href="/docs#stellar-agent-kit" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Docs</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Paywalled APIs (x402)</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Protect routes with Stellar payment. Server returns 402 with payment details; client pays then retries with <code className="rounded bg-zinc-800 px-1 text-xs">x402Fetch</code> and <code className="rounded bg-zinc-800 px-1 text-xs">payWithStellar</code>.</p>
                    <Link href="/docs#x402-stellar-sdk" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Docs</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flow" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">You ask</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">In the Chat or CLI agent: &ldquo;Swap 0.2 XLM to USDC&rdquo;, &ldquo;Check my balance&rdquo;, or &ldquo;Get a quote for 10 XLM → USDC&rdquo;.</p>
                    <Link href="/chat" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Open Chat</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Agent picks the tool</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">The LLM maps your request to a tool: check_balance, swap_asset, get_swap_quote, create_trustline—and fills parameters from context.</p>
                    <Link href="/devkit" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">DevKit</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Tool runs on Stellar</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Horizon, Soroban RPC, SoroSwap. Quote → build tx → you sign (e.g. Freighter or CLI) → submit. You get txHash or quote back.</p>
                    <Link href="/docs#cli" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">CLI docs</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect blur={0} borderWidth={2} spread={80} glow proximity={64} inactiveZone={0.01} disabled={false} />
                  <div className="relative bg-zinc-950 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-3">Result in chat or your app</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Balances, swap confirmation, trustline created, or a human-readable quote. Same flow works in your own app using the SDK.</p>
                    <Link href="/docs" className="inline-flex items-center text-[#a78bfa] hover:text-white transition-colors duration-300 group">
                      <span className="underline">Full docs</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA strip */}
          <div className="mt-16 pt-16 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-6 text-center">
            <Link href="/docs" className="rounded-full border border-zinc-600 bg-zinc-900/50 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all">
              Docs
            </Link>
            <Link href="/swap" className="rounded-full border border-zinc-600 bg-zinc-900/50 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all">
              Try Swap
            </Link>
            <Link href="/devkit" className="rounded-full border border-zinc-600 bg-zinc-900/50 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all">
              DevKit
            </Link>
            <Link href="/pricing" className="rounded-full bg-[#5100fd] text-white px-6 py-3 text-sm font-medium hover:bg-[#6610ff] transition-all">
              Pricing
            </Link>
          </div>
        </div>
      </section>
      </PageTransition>
    </main>
  )
}
