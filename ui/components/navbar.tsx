"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MobileMenu } from "./mobile-menu"
import { WalletData } from "./wallet-data"

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-6 w-full max-w-7xl transition-all duration-700 ease-in-out ${
        isVisible ? "top-8 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      <div className="bg-black/60 backdrop-blur-[120px] rounded-full px-6 py-2.5 flex items-center justify-between gap-6 shadow-lg shadow-black/20 border border-white/10 w-full">
        {/* Left: Logo + Docs, DevKit */}
        <div className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="flex items-center text-xl font-semibold text-white hover:text-zinc-200 transition-colors duration-500 ease-out shrink-0"
          >
            Warly
          </button>
          <div className="h-4 w-px bg-white/10" aria-hidden />
          <div className="flex items-center gap-1">
            <Link
              href="/docs"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
            >
              Docs
            </Link>
            <Link
              href="/devkit"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
            >
              DevKit
            </Link>
          </div>
        </div>

        {/* Mobile: logo only on left */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-lg font-semibold text-white hover:text-zinc-200 transition-colors duration-500 ease-out"
          >
            Warly
          </button>
        </div>

        {/* Right: Capabilities, Swap, Wallet, CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTo("capabilities")}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors duration-500 ease-out"
          >
            Capabilities
          </button>
          <Link
            href="/swap"
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors duration-500 ease-out"
          >
            Swap
          </Link>
          <WalletData />
          <a
            href="https://github.com/stellar/stellar-agent-kit"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-4 py-2 rounded-full border border-[#5100fd] bg-[#5100fd]/40 text-white text-sm font-medium hover:text-white hover:border-[#5100fd] hover:bg-[#5100fd]/60 transition-all duration-500 ease-out"
          >
            Get started
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center justify-end flex-1 pr-4">
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
