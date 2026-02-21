"use client"

import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircleArrowRight, Code2, Wallet, Zap, Bot, Github, Scale, ArrowLeftRight, Lock, MessageCircle, Cpu, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { ProtocolsIntegratedSection } from "@/components/protocols-integrated"
import { ScrambleText } from "@/components/scramble-text"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { DotPattern } from "@/components/dot-pattern"

export default function Home() {
  const scrollToCapabilities = () => {
    document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>

      {/* Hero — centered, large (majority of viewport) with dot pattern background */}
      <div className="relative min-h-[85vh] w-full">
        <DotPattern
          fixed={false}
          baseColor="#52525b"
          glowColor="#a78bfa"
          gap={20}
          dotSize={2.5}
          proximity={140}
          waveSpeed={0.4}
          baseOpacityMin={0.45}
          baseOpacityMax={0.7}
        />
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

          <BentoGrid className="lg:grid-rows-3">
            <BentoCard
              Icon={Zap}
              name="Create DevKit App"
              description="Scaffold Agent Kit or x402 API in one command. Copy .env and run."
              href="/docs#create-stellar-devkit-app"
              cta="Learn more"
              background={<img className="absolute -top-20 -right-20 opacity-60" />}
              className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
            />
            <BentoCard
              Icon={Code2}
              name="Stellar Agent Kit"
              description="Payments, DEX quotes & swaps (SoroSwap), lending (Blend), oracles (Reflector)."
              href="/docs#stellar-agent-kit"
              cta="Learn more"
              background={<img className="absolute -top-20 -right-20 opacity-60" />}
              className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
            />
            <BentoCard
              Icon={Wallet}
              name="x402 Stellar SDK"
              description="HTTP 402 middleware and x402Fetch. Monetize APIs with Stellar."
              href="/docs#x402-stellar-sdk"
              cta="Learn more"
              background={<img className="absolute -top-20 -right-20 opacity-60" />}
              className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
            />
            <BentoCard
              Icon={Bot}
              name="Stellar DevKit MCP"
              description="Contract IDs, SDK snippets, live quotes. Cursor and Claude."
              href="/devkit"
              cta="Learn more"
              background={<img className="absolute -top-20 -right-20 opacity-60" />}
              className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
            />
            <BentoCard
              Icon={CheckCircle}
              name="Notifications"
              description="Get notified when someone shares a file or mentions you in a comment."
              href="/docs"
              cta="Learn more"
              background={<img className="absolute -top-20 -right-20 opacity-60" />}
              className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
            />
          </BentoGrid>

          {/* Protocols Integrated — 5 protocols from the kit */}
          <ProtocolsIntegratedSection />

          {/* Try it yourself — code snippet + CTA (dot pattern background) */}
          <section id="try-it" className="relative z-20 py-16 scroll-mt-24 overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <DotPattern
                fixed={false}
                baseColor="#3f3f46"
                glowColor="#a78bfa"
                gap={22}
                dotSize={2.5}
                proximity={100}
                waveSpeed={0.3}
                baseOpacityMin={0.45}
                baseOpacityMax={0.7}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
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
                <LiquidMetalButton
                  href="/docs#quick-start"
                  label="Take me to the code >>"
                  width={220}
                />
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
              <TabsTrigger value="tools" className="text-zinc-500 data-[state=active]:bg-zinc-600 data-[state=active]:text-white px-8 py-3 rounded-full transition-all">
                Agent tools
              </TabsTrigger>
              <TabsTrigger value="flow" className="text-zinc-500 data-[state=active]:bg-zinc-600 data-[state=active]:text-white px-8 py-3 rounded-full transition-all">
                How it works
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-8">
              <BentoGrid className="lg:grid-rows-3">
                <BentoCard
                  Icon={Wallet}
                  name="Payments & path payments"
                  description="Send XLM or custom assets; create accounts; path payments via StellarAgentKit or CLI pay."
                  href="/docs#stellar-agent-kit"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
                />
                <BentoCard
                  Icon={Scale}
                  name="Check balance"
                  description="Get native + trustline balances via Horizon. Use agent.getBalances() or the CLI."
                  href="/docs#stellar-agent-kit"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
                />
                <BentoCard
                  Icon={ArrowLeftRight}
                  name="Swap assets"
                  description="DEX swaps via SoroSwap. dexGetQuote + dexSwap, or try the in-browser Swap with Freighter."
                  href="/swap"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
                />
                <BentoCard
                  Icon={Lock}
                  name="Paywalled APIs"
                  description="Protect routes with Stellar payment. Server returns 402; client pays with x402Fetch and payWithStellar."
                  href="/docs#x402-stellar-sdk"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
                />
                <BentoCard
                  Icon={CheckCircle}
                  name="Notifications"
                  description="Get notified when someone shares a file or mentions you in a comment."
                  href="/docs"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
                />
              </BentoGrid>
            </TabsContent>

            <TabsContent value="flow" className="mt-8">
              <BentoGrid className="lg:grid-rows-3">
                <BentoCard
                  Icon={Zap}
                  name="Tool runs on Stellar"
                  description="Horizon, Soroban RPC, SoroSwap. Quote → build tx → you sign (Freighter or CLI) → submit."
                  href="/docs#cli"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
                />
                <BentoCard
                  Icon={MessageCircle}
                  name="You ask"
                  description={'In Chat or CLI: "Swap 0.2 XLM to USDC", "Check my balance", or "Get a quote for 10 XLM → USDC".'}
                  href="/chat"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
                />
                <BentoCard
                  Icon={Cpu}
                  name="Agent picks the tool"
                  description="The LLM maps your request to a tool: check_balance, swap_asset, get_swap_quote, create_trustline."
                  href="/devkit"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
                />
                <BentoCard
                  Icon={CheckCircle}
                  name="Result in chat or your app"
                  description="Balances, swap confirmation, trustline created, or a quote. Same flow in your own app."
                  href="/docs"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
                />
                <BentoCard
                  Icon={Scale}
                  name="Notifications"
                  description="Get notified when someone shares a file or mentions you in a comment."
                  href="/docs"
                  cta="Learn more"
                  background={<img className="absolute -top-20 -right-20 opacity-60" />}
                  className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
                />
              </BentoGrid>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA strip */}
          <div className="mt-16 pt-16 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-6 text-center">
            <Link href="/docs" className="rounded-full border border-zinc-600 bg-zinc-900/50 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-500 transition-all">
              Docs
            </Link>
            <LiquidMetalButton href="/swap" label="Try Swap" width={120} />
            <LiquidMetalButton href="/devkit" label="DevKit" width={100} />
            <LiquidMetalButton href="/pricing" label="Pricing" width={110} />
          </div>
        </div>
      </section>
      </PageTransition>
    </main>
  )
}
