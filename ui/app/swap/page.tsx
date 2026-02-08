"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { SwapInterface } from "@/components/swap-interface"
import { SendInterface } from "@/components/send-interface"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageTransition } from "@/components/page-transition"
import Script from "next/script"

export default function SwapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") === "send" ? "send" : "swap"
  const [activeTab, setActiveTab] = useState<"swap" | "send">(tabFromUrl)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Keep URL in sync when tab changes (so Send is always reachable and visible)
  useEffect(() => {
    setActiveTab(tabFromUrl)
  }, [tabFromUrl])

  const onTabChange = useCallback(
    (value: string) => {
      const next = value === "send" ? "send" : "swap"
      setActiveTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === "send") params.set("tab", "send")
      else params.delete("tab")
      router.replace(params.toString() ? `/swap?${params}` : "/swap", { scroll: false })
    },
    [router, searchParams]
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const linesOpacity = 1 - scrollProgress
  const linesScale = 1 - scrollProgress * 0.3

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.0.17/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />

      <Navbar />

      <div
        className="fixed inset-0 z-0 w-screen h-screen pointer-events-none transition-[opacity,transform] duration-500 ease-out"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="bg-lines-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2269"
            height="2108"
            viewBox="0 0 2269 2108"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Animated Purple Lines */}
            <path
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-1"
            />
            <path
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-2"
            />
            <path
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-3"
            />
            <path
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-4"
            />

            {/* Static White Background Lines */}
            <path
              opacity="0.2"
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>

      {/* 3D Spline Viewer */}
      <div
        className="fixed right-0 top-0 w-1/2 h-screen pointer-events-none z-10 transition-[opacity,transform] duration-500 ease-out"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="track">
          <spline-viewer
            url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
            className="w-full h-full"
            style={{ position: "sticky", top: "0px", height: "100vh" }}
          />
        </div>
      </div>

      {/* Swap Content */}
      <PageTransition>
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-32 min-h-screen flex flex-col justify-center overflow-x-hidden">
        <div className="max-w-md mx-auto w-full min-w-0">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-none text-balance">
              Swap & Send
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              Swap XLM ↔ USDC via SoroSwap, Phoenix, Aqua. Send XLM or USDC to any address.
            </p>
          </div>

          {/* Swap / Send Tabs — both always visible; smooth transition */}
          <div className="animate-fade-in-up animation-delay-200">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl transition-colors duration-300">
                <TabsTrigger
                  value="swap"
                  className="rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="send"
                  className="rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Send
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
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      </PageTransition>
    </main>
  )
}