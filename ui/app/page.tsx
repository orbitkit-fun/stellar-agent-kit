"use client"

import { type ReactNode } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { Wallet, Zap, Bot, Github, ArrowLeftRight, Copy, Code2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { Footer } from "@/components/footer"
import { ProtocolsIntegratedSection } from "@/components/protocols-integrated"
import { CommunityProjectsSection } from "@/components/community-projects-section"
import { TrustedByMarquee } from "@/components/trusted-by-marquee"
import { ScrambleText } from "@/components/scramble-text"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { DotPattern } from "@/components/dot-pattern"
import { DevKitAnimatedBeam } from "@/components/devkit-animated-beam"
import { CodeWindow } from "@/components/code-window"

const LANDING_VIEWPORT = { once: true, amount: 0.08 }
const LANDING_TRANSITION = { duration: 0.7, ease: [0.22, 1, 0.36, 1] }

function FadeInSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={LANDING_VIEWPORT}
      transition={LANDING_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const TRY_IT_SNIPPET = `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";
const secretKey = process.env.SECRET_KEY;
if (!secretKey) throw new Error("SECRET_KEY is required. Set it in .env or .env.local.");
const agent = new StellarAgentKit(secretKey, "mainnet");
await agent.initialize();

// Get a swap quote (1 XLM → USDC, 7 decimals)
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);`

const NPX_COMMAND = "npx create-stellar-devkit-app"

export default function Home() {
  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(NPX_COMMAND)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>

      {/* Hero — full viewport so Trusted By only appears after scroll */}
      <div className="relative z-30 min-h-screen w-full overflow-hidden isolate bg-black shrink-0">
        <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen min-h-full pointer-events-none" aria-hidden>
          <DotPattern
            fixed={false}
            baseColor="#71717a"
            glowColor="#a78bfa"
            gap={22}
            dotSize={2.5}
            proximity={140}
            waveSpeed={0.4}
            baseOpacityMin={0.32}
            baseOpacityMax={0.52}
          />
        </div>
        <div id="hero" className="relative z-20 container mx-auto px-6 lg:px-12 pt-32 pb-40 min-h-screen flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center max-w-3xl mx-auto w-full">
            <div className="mb-10 md:mb-14 animate-fade-in w-fit mix-blend-screen">
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
          <div className="flex flex-col items-center gap-4 animate-fade-in-up animation-delay-400">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/stellar/stellar-agent-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
              <LiquidMetalButton href="/docs" label="Docs" width={80} />
            </div>
            <button
              type="button"
              onClick={copyCommand}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-500/70 bg-white/5 px-5 py-3 text-sm font-mono text-zinc-200 transition-colors hover:border-zinc-400 hover:bg-white/10"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              <span>{NPX_COMMAND}</span>
              <Copy className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Trusted by — only in view after hero; contained so it never bleeds into hero */}
      <div className="relative z-10 overflow-hidden shrink-0">
      <FadeInSection>
        <TrustedByMarquee />
      </FadeInSection>
      </div>

      {/* SDK Features — four pillars */}
      <section id="capabilities" className="relative z-20 py-20 scroll-mt-24 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <DotPattern
            fixed={false}
            baseColor="#52525b"
            glowColor="#a78bfa"
            gap={24}
            dotSize={2.5}
            proximity={100}
            waveSpeed={0.3}
            baseOpacityMin={0.28}
            baseOpacityMax={0.48}
            className="w-full h-full"
          />
        </div>
        <FadeInSection className="container mx-auto max-w-5xl px-6 lg:px-12">
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
            >
              <DevKitAnimatedBeam />
            </BentoCard>
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
          <FadeInSection>
            <ProtocolsIntegratedSection />
          </FadeInSection>

          {/* Supported Community Projects */}
          <FadeInSection>
            <CommunityProjectsSection />
          </FadeInSection>

          {/* Try it yourself — code snippet + CTA (dot pattern background, full width) */}
        </FadeInSection>
      </section>

      {/* Try it out — code + CTA */}
      <section id="try-it" className="relative z-20 py-16 scroll-mt-24 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <DotPattern
            fixed={false}
            baseColor="#52525b"
            glowColor="#a78bfa"
            gap={24}
            dotSize={2.5}
            proximity={100}
            waveSpeed={0.3}
            baseOpacityMin={0.28}
            baseOpacityMax={0.48}
            className="w-full h-full"
          />
        </div>
        <FadeInSection className="container mx-auto max-w-5xl px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            <CodeWindow code={TRY_IT_SNIPPET} title="stellar-agent-kit.ts" />
            <div className="flex flex-col items-start justify-center lg:px-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                <ScrambleText text="TRY IT OUT FOR YOURSELF" as="span" />
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-md" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Run the SDK in Node or the browser. Get a quote, build a swap, then sign with Freighter or the CLI.
              </p>
              <LiquidMetalButton
                href="/docs#quick-start"
                label="Take me to the code >>"
                width={280}
                noGradient
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* SDK Components — text left, 2 big cards right */}
      <section id="sdk-components" className="relative z-20 py-24 scroll-mt-24 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
          <FadeInSection className="container mx-auto max-w-5xl px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

            {/* Left — text + CTA */}
            <div className="flex flex-col items-start justify-center lg:px-4">
            <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
                <ScrambleText text="READY-MADE STELLAR COMPONENTS" as="span" />
            </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-md" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Drop in address inputs, balance displays, swap quote cards, and payment modals. Built for the Stellar ecosystem — connect Freighter and go.
              </p>
              <LiquidMetalButton href="/devkit" label="Explore the DevKit >>" width={280} noGradient />
            </div>

            {/* Right — two large component preview cards */}
            <div className="flex flex-col gap-4">

              {/* Card 1: Address input — large */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-7">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white mb-5 text-center">Address Input</p>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 mb-5">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-xs font-bold text-zinc-300">G</div>
                  <span className="flex-1 font-mono text-sm text-zinc-300 truncate">GABCD ... XYZ9</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 shrink-0" />
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed text-center">
                  Shows Stellar account identicons and truncates public keys. Supports paste, validation, and copy.
                </p>
              </div>

              {/* Card 2: Swap quote — large */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-7">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white mb-5 text-center">Swap Quote</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-center">
                    <p className="text-lg font-semibold font-mono text-white">10 XLM</p>
                    <p className="text-xs text-zinc-600 mt-0.5">You pay</p>
                  </div>
                  <ArrowLeftRight className="w-5 h-5 text-zinc-600 shrink-0" />
                  <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-center">
                    <p className="text-lg font-semibold font-mono text-white">1.12 USDC</p>
                    <p className="text-xs text-zinc-600 mt-0.5">You receive</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed text-center">Route: SoroSwap · Slippage 0.5% · Estimated fee 0.001 XLM</p>
              </div>

            </div>
          </div>
        </FadeInSection>
      </section>

      <Footer />
      </PageTransition>
    </main>
  )
}
