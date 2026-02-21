"use client"

import { LiquidMetalButton } from "@/components/liquid-metal-button"
import { ViewModeToggle } from "@/components/view-mode-toggle"
import { useState } from "react"

export default function Page() {
  const [viewMode, setViewMode] = useState<"text" | "icon">("text")

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center gap-12"
      style={{
        background: "#000000",
      }}
    >
      <LiquidMetalButton viewMode={viewMode} />
      <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
    </div>
  )
}
