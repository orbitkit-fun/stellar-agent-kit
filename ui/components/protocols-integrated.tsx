"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrambleText } from "@/components/scramble-text"

// 5 protocols integrated in the kit — logos from brand/logos (copied to public/brand/logos)
const PROTOCOLS = [
  { name: "SoroSwap Finance", href: "https://soroswap.finance", logo: "/brand/logos/soroswap.svg" },
  { name: "Blend", href: "https://blend.capital", logo: "/brand/logos/blend.svg" },
  { name: "Allbridge Core", href: "https://docs-core.allbridge.io/sdk/guides/stellar", logo: "/brand/logos/allbridge.svg" },
  { name: "FxDAO", href: "https://fxdao.io/docs", logo: "/brand/logos/FxDAO.svg" },
  { name: "Reflector", href: "https://developers.stellar.org/docs/data/oracles/oracle-providers", logo: "/brand/logos/relflector.svg" },
] as const

const LOGO_SIZE = 64

function ProtocolLogo({
  name,
  href,
  logo,
}: {
  name: string
  href: string
  logo: string
}) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center rounded-2xl p-3 transition-all duration-300 hover:scale-110 hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      title={name}
      aria-label={`Open ${name}`}
    >
      <span
        className="inline-flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]"
        style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
      >
        {!logoFailed ? (
          <img
            src={logo}
            alt=""
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ maxWidth: LOGO_SIZE, maxHeight: LOGO_SIZE }}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-xl bg-zinc-800 font-bold text-lg text-zinc-500">
            {name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2) || name.slice(0, 2)}
          </span>
        )}
      </span>
    </a>
  )
}

export function ProtocolsIntegratedSection() {
  return (
    <section id="protocols" className="relative z-20 py-20 scroll-mt-24">
      <div className="text-center mb-12">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-4"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <ScrambleText text="PROTOCOLS INTEGRATED" as="span" />
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Explore the leading protocols integrated with Stellar DevKit.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {PROTOCOLS.map((p) => (
          <ProtocolLogo key={p.name} name={p.name} href={p.href} logo={p.logo} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button
          variant="outline"
          size="lg"
          asChild
          className="rounded-full border-zinc-600 bg-zinc-900/90 text-white hover:bg-zinc-800 hover:border-zinc-500 hover:text-white"
        >
          <Link href="/protocols">
            View all protocols — Try it, get code, or open docs
          </Link>
        </Button>
      </div>
    </section>
  )
}
