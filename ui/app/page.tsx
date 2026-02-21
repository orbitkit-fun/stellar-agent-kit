"use client"

import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircleArrowRight, ArrowRight, Code2, Wallet, Zap, Bot, Github, Scale, ArrowLeftRight, Lock, MessageCircle, Cpu, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { ProtocolsIntegratedSection } from "@/components/protocols-integrated"
import { ScrambleText } from "@/components/scramble-text"
import { FeatureCard } from "@/components/feature-card"

export default function Home() {
  const scrollToCapabilities = () => {
    document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>

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
            <ScrambleText text="The developer suite for building on Stellar." as="span" />
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

      {/* SDK Features — four pillars */}
      <section id="capabilities" className="relative z-20 py-20 scroll-mt-24">
        <div className="container mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <ScrambleText text="Everything your agents need to build on Stellar" as="span" />
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Code2 className="h-5 w-5" strokeWidth={2} />}
              label="Unified SDK"
              title="Stellar Agent Kit"
              description="Payments, DEX quotes & swaps (SoroSwap), lending (Blend), oracles (Reflector)."
              href="/docs#stellar-agent-kit"
            />
            <FeatureCard
              icon={<Wallet className="h-5 w-5" strokeWidth={2} />}
              label="Monetization"
              title="x402 Stellar SDK"
              description="HTTP 402 middleware and x402Fetch. Monetize APIs with Stellar."
              href="/docs#x402-stellar-sdk"
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" strokeWidth={2} />}
              label="Scaffolding"
              title="Create DevKit App"
              description="Scaffold Agent Kit or x402 API in one command. Copy .env and run."
              href="/docs#create-stellar-devkit-app"
            />
            <FeatureCard
              icon={<Bot className="h-5 w-5" strokeWidth={2} />}
              label="MCP Server"
              title="Stellar DevKit MCP"
              description="Contract IDs, SDK snippets, live quotes. Cursor and Claude."
              href="/devkit"
            />
          </div>

          {/* Protocols Integrated — 5 protocols from the kit */}
          <ProtocolsIntegratedSection />

          {/* Try it yourself — code snippet + CTA */}
          <section id="try-it" className="relative z-20 py-16 scroll-mt-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="text-zinc-500 text-xs font-medium ml-2">stellar-agent-kit</span>
                </div>
                <div className="p-4 font-mono text-sm overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">1</td><td className="text-zinc-400"><span className="text-[#c678dd]">import</span> {"{ StellarAgentKit, MAINNET_ASSETS }"} <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">&quot;stellar-agent-kit&quot;</span></td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">2</td><td className="text-zinc-400"></td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">3</td><td className="text-zinc-400"><span className="text-[#c678dd]">const</span> agent <span className="text-[#e06c75]">=</span> <span className="text-[#c678dd]">new</span> <span className="text-[#61afef]">StellarAgentKit</span>(process.<span className="text-[#d19a66]">env</span>.<span className="text-[#61afef]">SECRET_KEY</span>, <span className="text-[#98c379]">&quot;mainnet&quot;</span>)</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">4</td><td className="text-zinc-400"><span className="text-[#c678dd]">await</span> agent.<span className="text-[#61afef]">initialize</span>()</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">5</td><td className="text-zinc-400"></td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">6</td><td className="text-zinc-500"><span className="text-zinc-600">// Get a swap quote (1 XLM → USDC)</span></td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">7</td><td className="text-zinc-400"><span className="text-[#c678dd]">const</span> quote <span className="text-[#e06c75]">=</span> <span className="text-[#c678dd]">await</span> agent.<span className="text-[#61afef]">dexGetQuote</span>(</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">8</td><td className="text-zinc-400">  {"{ contractId: MAINNET_ASSETS.XLM.contractId }"},</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">9</td><td className="text-zinc-400">  {"{ contractId: MAINNET_ASSETS.USDC.contractId }"},</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">10</td><td className="text-zinc-400">  <span className="text-[#98c379]">&quot;10000000&quot;</span></td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">11</td><td className="text-zinc-400">)</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">12</td><td className="text-zinc-400"><span className="text-[#c678dd]">const</span> result <span className="text-[#e06c75]">=</span> <span className="text-[#c678dd]">await</span> agent.<span className="text-[#61afef]">dexSwap</span>(quote)</td></tr>
                      <tr><td className="text-zinc-500 select-none w-8 align-top py-0.5 pr-3">13</td><td className="text-zinc-400">console.<span className="text-[#61afef]">log</span>(result.hash)</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-col items-start justify-center lg:pl-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  <ScrambleText text="TRY IT OUT FOR YOURSELF" as="span" />
                </h2>
                <p className="text-zinc-400 text-lg mb-8 max-w-md" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Run the SDK in Node or the browser. Get a quote, build a swap, then sign with Freighter or the CLI.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-zinc-600 bg-zinc-900/80 text-white hover:bg-zinc-800 hover:border-zinc-500 hover:text-white px-8 py-6 text-base font-medium"
                >
                  <Link href="/docs#quick-start" className="inline-flex items-center gap-2">
                    <Github className="h-5 w-5 shrink-0" />
                    Take me to the code &gt;&gt;
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <ScrambleText text="CAPABILITIES" as="span" />
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Use the CLI agent (balance, pay, chat with tools) or build your own flow with the SDK. Swap and Send in the browser with Freighter—no secret key in the client.
            </p>
          </div>

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
              <div className="grid gap-6 md:grid-cols-2">
                <FeatureCard
                  icon={<Scale className="h-5 w-5" strokeWidth={2} />}
                  label="Balance"
                  title="Check balance"
                  description="Get native + trustline balances via Horizon. Use agent.getBalances() or the CLI."
                  href="/docs#stellar-agent-kit"
                  cta="Docs"
                />
                <FeatureCard
                  icon={<ArrowLeftRight className="h-5 w-5" strokeWidth={2} />}
                  label="DEX"
                  title="Swap assets"
                  description="DEX swaps via SoroSwap. dexGetQuote + dexSwap, or try the in-browser Swap with Freighter."
                  href="/swap"
                  cta="Try Swap"
                />
                <FeatureCard
                  icon={<Wallet className="h-5 w-5" strokeWidth={2} />}
                  label="Payments"
                  title="Payments & path payments"
                  description="Send XLM or custom assets; create accounts; path payments via StellarAgentKit or CLI pay."
                  href="/docs#stellar-agent-kit"
                  cta="Docs"
                />
                <FeatureCard
                  icon={<Lock className="h-5 w-5" strokeWidth={2} />}
                  label="x402"
                  title="Paywalled APIs"
                  description="Protect routes with Stellar payment. Server returns 402; client pays with x402Fetch and payWithStellar."
                  href="/docs#x402-stellar-sdk"
                  cta="Docs"
                />
              </div>
            </TabsContent>

            <TabsContent value="flow" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FeatureCard
                  icon={<MessageCircle className="h-5 w-5" strokeWidth={2} />}
                  label="Step 1"
                  title="You ask"
                  description={'In Chat or CLI: "Swap 0.2 XLM to USDC", "Check my balance", or "Get a quote for 10 XLM → USDC".'}
                  href="/chat"
                  cta="Open Chat"
                />
                <FeatureCard
                  icon={<Cpu className="h-5 w-5" strokeWidth={2} />}
                  label="Step 2"
                  title="Agent picks the tool"
                  description="The LLM maps your request to a tool: check_balance, swap_asset, get_swap_quote, create_trustline."
                  href="/devkit"
                  cta="DevKit"
                />
                <FeatureCard
                  icon={<Zap className="h-5 w-5" strokeWidth={2} />}
                  label="Step 3"
                  title="Tool runs on Stellar"
                  description="Horizon, Soroban RPC, SoroSwap. Quote → build tx → you sign (Freighter or CLI) → submit."
                  href="/docs#cli"
                  cta="CLI docs"
                />
                <FeatureCard
                  icon={<CheckCircle className="h-5 w-5" strokeWidth={2} />}
                  label="Step 4"
                  title="Result in chat or your app"
                  description="Balances, swap confirmation, trustline created, or a quote. Same flow in your own app."
                  href="/docs"
                  cta="Full docs"
                />
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
