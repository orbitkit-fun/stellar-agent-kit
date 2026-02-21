"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { SwapInterface } from "@/components/swap-interface";
import { SendInterface } from "@/components/send-interface";
import { PricesInterface } from "@/components/prices-interface";
import { LendingInterface } from "@/components/lending-interface";
import { BridgeInterface } from "@/components/bridge-interface";
import { FxdaoInterface } from "@/components/fxdao-interface";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Tab = "swap" | "send" | "prices" | "lending" | "bridge" | "fxdao";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tabFromUrl: Tab = 
    tabParam === "send" ? "send" : 
    tabParam === "prices" ? "prices" : 
    tabParam === "lending" ? "lending" :
    tabParam === "bridge" ? "bridge" :
    tabParam === "fxdao" ? "fxdao" : "swap";
  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl);

  // Keep URL in sync when tab changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const onTabChange = useCallback(
    (value: string) => {
      const next = (
        value === "send" ? "send" : 
        value === "prices" ? "prices" : 
        value === "lending" ? "lending" :
        value === "bridge" ? "bridge" :
        value === "fxdao" ? "fxdao" : "swap"
      ) as Tab;
      setActiveTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "swap") params.delete("tab");
      else params.set("tab", next);
      router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />

      {/* Main Content - Copy exact structure from landing page */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-32 min-h-screen flex flex-col justify-center overflow-x-hidden">
        <div className="max-w-md mx-auto w-full min-w-0">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-none">
              Stellar Agent Kit
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              Swap, Send, Lend, Bridge & DeFi on Stellar. All protocols integrated.
            </p>
          </div>

          {/* Protocol Tabs - All 5 protocols */}
          <div className="animate-fade-in-up animation-delay-200">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-11 items-center bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl transition-colors duration-300">
                <TabsTrigger
                  value="swap"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="send"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Send
                </TabsTrigger>
                <TabsTrigger
                  value="prices"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Prices
                </TabsTrigger>
              </TabsList>
              
              {/* Second row of tabs */}
              <TabsList className="grid w-full grid-cols-3 mb-6 h-11 items-center bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl transition-colors duration-300">
                <TabsTrigger
                  value="lending"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Lending
                </TabsTrigger>
                <TabsTrigger
                  value="bridge"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  Bridge
                </TabsTrigger>
                <TabsTrigger
                  value="fxdao"
                  className="flex h-full min-h-0 items-center justify-center rounded-lg py-0 text-sm font-medium leading-none transition-all duration-300 ease-out data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-zinc-300 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white"
                >
                  FxDAO
                </TabsTrigger>
              </TabsList>

              <div className="relative min-h-[320px] w-full overflow-hidden">
                <TabsContent
                  value="swap"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <SwapInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="send"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <SendInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="prices"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <PricesInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="lending"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <LendingInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="bridge"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <BridgeInterface />
                  </div>
                </TabsContent>
                <TabsContent
                  value="fxdao"
                  forceMount
                  className="w-full relative z-10 data-[state=inactive]:z-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-0 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 outline-none transition-opacity duration-300 ease-out"
                >
                  <div className="w-full min-w-0">
                    <FxdaoInterface />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
