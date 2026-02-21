"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { GlassSurface } from "./glass-surface"
import { MobileMenu } from "./mobile-menu"
import { WalletData } from "./wallet-data"

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const last = lastScrollYRef.current

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < last || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > last && currentScrollY > 100) {
        setIsVisible(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-5xl transition-all duration-700 ease-in-out ${
        isVisible ? "top-6 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      <GlassSurface
        width="100%"
        height={64}
        borderRadius={9999}
        backgroundOpacity={0.08}
        saturation={1.2}
        forceDark
        simpleGlass
        className="px-8 py-4 flex items-center justify-center min-w-0 w-full shadow-lg shadow-black/20"
        contentClassName="p-0 w-full flex items-center justify-center gap-6 min-w-0"
      >
        {/* Centered: Logo + Nav + Wallet */}
        <div className="hidden sm:flex items-center justify-center gap-6 flex-wrap min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-white hover:text-zinc-200 transition-colors duration-300 shrink-0"
          >
            <Image src="/brand/orbit/orbit.png" alt="Orbit" width={28} height={28} className="shrink-0" />
            Orbit
          </Link>
          <span className="hidden md:block w-px h-5 bg-zinc-700 shrink-0" aria-hidden />
          <nav className="flex items-center gap-1" aria-label="Main">
            <Link
              href="/docs"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              Docs
            </Link>
            <Link
              href="/devkit"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              DevKit
            </Link>
            <Link
              href="/protocols"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              Protocols
            </Link>
            <Link
              href="/swap"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              Demo
            </Link>
            <Link
              href="/chat"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              Chat
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 rounded-md"
            >
              Pricing
            </Link>
          </nav>
          <span className="hidden md:block w-px h-5 bg-zinc-700 shrink-0" aria-hidden />
          <div className="shrink-0">
            <WalletData />
          </div>
        </div>

        {/* Mobile: logo left, menu right */}
        <div className="flex sm:hidden items-center w-full justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-white hover:text-zinc-200 transition-colors duration-300"
          >
            <Image src="/brand/orbit/orbit.png" alt="Orbit" width={24} height={24} className="shrink-0" />
            Orbit
          </Link>
          <MobileMenu />
        </div>
      </GlassSurface>
    </nav>
  )
}
