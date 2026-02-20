"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WalletData } from "./wallet-data"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 text-white hover:text-zinc-300 transition-colors" aria-label="Menu">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-zinc-950 border-zinc-800 w-full max-w-xs">
        <div className="flex flex-col gap-1 pt-8">
          <div className="pb-4 mb-2 border-b border-zinc-800">
            <WalletData />
          </div>
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-left py-3 px-3 text-base text-white hover:text-zinc-200 transition-colors duration-500 ease-out"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollTo("capabilities")}
            className="text-left py-3 px-3 text-base text-zinc-300 hover:text-white transition-colors duration-500 ease-out"
          >
            Capabilities
          </button>
          <span className="mt-2 mb-1 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Resources
          </span>
          <Link
            href="/docs"
            onClick={() => setOpen(false)}
            className="text-left py-3 px-3 text-base text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
          >
            Docs
          </Link>
          <Link
            href="/devkit"
            onClick={() => setOpen(false)}
            className="text-left py-3 px-3 text-base text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
          >
            DevKit
          </Link>
          <Link
            href="/swap"
            onClick={() => setOpen(false)}
            className="text-left py-3 px-3 text-base text-zinc-300 hover:text-white transition-colors duration-500 ease-out"
          >
            Swap
          </Link>
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="text-left py-3 px-3 text-base text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
          >
            Chat
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="text-left py-3 px-3 text-base text-zinc-400 hover:text-white transition-colors duration-500 ease-out"
          >
            Pricing
          </Link>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <a
              href="https://github.com/stellar/stellar-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block text-center py-3 rounded-lg border border-[#5100fd] bg-[#5100fd]/30 text-[#a78bfa] font-medium hover:bg-[#5100fd]/50 hover:text-white transition-all duration-500 ease-out"
            >
              Get started
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
