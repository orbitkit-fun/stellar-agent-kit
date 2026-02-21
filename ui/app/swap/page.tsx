"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { SwapInterface } from "@/components/swap-interface"
import { SendInterface } from "@/components/send-interface"
import { PricesInterface } from "@/components/prices-interface"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageTransition } from "@/components/page-transition"

export default function SwapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tabFromUrl = tabParam === "send" ? "send" : tabParam === "prices" ? "prices" : "swap"
  const [activeTab, setActiveTab] = useState<"swap" | "send" | "prices">(tabFromUrl)

  // Keep URL in sync when tab changes (so Send is always reachable and visible)
  useEffect(() => {
    setActiveTab(tabFromUrl)
  }, [tabFromUrl])

  const onTabChange = useCallback(
    (value: string) => {
      const next = (value === "send" ? "send" : value === "prices" ? "prices" : "swap") as "swap" | "send" | "prices"
      setActiveTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === "send") params.set("tab", "send")
      else if (next === "prices") params.set("tab", "prices")
      else params.delete("tab")
      router.replace(params.toString() ? `/swap?${params}` : "/swap", { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />

      {/* Swap Content */}
      <PageTransition>
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-32 min-h-screen flex flex-col justify-center overflow-x-hidden">
        <div className="max-w-md mx-auto w-full min-w-0">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-none">
              Swap & Send
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              Swap XLM ↔ USDC via SoroSwap, Phoenix, Aqua. Send XLM or USDC to any address.
            </p>
          </div>

          {/* Swap / Send Tabs — both always visible; smooth transition */}
          <div className="animate-fade-in-up animation-delay-200">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-11 items-center bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl transition-colors duration-300">
                <TabsTrigger
                  value="swap"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-zinc-600 data-[state=active]:text-white"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="send"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-zinc-600 data-[state=active]:text-white"
                >
                  Send
                </TabsTrigger>
                <TabsTrigger
                  value="prices"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-zinc-600 data-[state=active]:text-white"
                >
                  Prices
                </TabsTrigger>
              </TabsList>
              <div className="relative min-h-[320px] w-full overflow-hidden">
                <TabsContent
                  value="swap"
                  forceMount
                  className="swap-send-tab-content w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <SwapInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="send"
                  forceMount
                  className="swap-send-tab-content w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <SendInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="prices"
                  forceMount
                  className="swap-send-tab-content w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <PricesInterface />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      </PageTransition>
    </main>
  )
}