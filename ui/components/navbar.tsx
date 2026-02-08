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
      <div className="bg-black/60 backdrop-blur-[120px] rounded-full px-6 py-2.5 flex items-center justify-between gap-4 min-w-0 w-full shadow-lg shadow-black/20 border border-white/10">
        {/* Left: Logo */}
        <div className="hidden sm:flex items-center min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="flex items-center text-xl font-semibold text-white hover:text-zinc-200 transition-colors duration-500 ease-out"
          >
            Warly
          </button>
        </div>

        {/* Center: Docs, DevKit, Capabilities, Demo */}
        <div className="hidden sm:flex items-center justify-center gap-2 flex-1 min-w-0">
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
            Demo
          </Link>
          <Link
            href="/chat"
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
          >
            Chat
          </Link>
        </div>

        {/* Right: Wallet, Get started */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
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

        {/* Mobile: logo left, menu right */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-lg font-semibold text-white hover:text-zinc-200 transition-colors duration-500 ease-out"
          >
            Warly
          </button>
        </div>
        <div className="flex sm:hidden items-center justify-end flex-1">
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
