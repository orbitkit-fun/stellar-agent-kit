"use client"

import { type ReactNode } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircleArrowRight, Code2, Wallet, Zap, Bot, Github, Scale, ArrowLeftRight, Lock, MessageCircle, Cpu, CheckCircle } from "lucide-react"
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

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Get a swap quote (1 XLM → USDC, 7 decimals)
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log(result.hash);`

export default function Home() {
  const scrollToCapabilities = () => {
    document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>

      {/* Hero — centered, large (majority of viewport) with dot pattern background */}
      <div className="relative min-h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen min-h-full" aria-hidden>
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
        <div id="hero" className="relative z-20 container mx-auto px-6 lg:px-12 pt-32 pb-40 min-h-[85vh] flex flex-col items-center justify-center text-center">
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
            <LiquidMetalButton href="/docs" label="Docs" width={80} />
          </div>
        </div>
        </div>
      </div>

      {/* Trusted by — marquee of partner logos */}
      <FadeInSection>
        <TrustedByMarquee />
      </FadeInSection>

      {/* SDK Features — four pillars */}
      <section id="capabilities" className="relative z-20 py-20 scroll-mt-24">
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

        <section id="try-it" className="relative z-20 py-16 scroll-mt-24 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-screen min-h-full -z-10" aria-hidden>
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

          <FadeInSection className="container mx-auto max-w-5xl px-6 lg:px-12">
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
          <FadeInSection className="mt-16 pt-16 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-6 text-center">
            <LiquidMetalButton href="/docs" label="Docs" width={80} />
            <LiquidMetalButton href="/swap" label="Try Swap" width={120} />
            <LiquidMetalButton href="/devkit" label="DevKit" width={100} />
            <LiquidMetalButton href="/pricing" label="Pricing" width={110} />
          </FadeInSection>
        </FadeInSection>
      </section>

      <Footer />
      </PageTransition>
    </main>
  )
}
