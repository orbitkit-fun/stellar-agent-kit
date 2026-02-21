"use client"

import { useState } from "react"
import { Type, Sparkles } from "lucide-react"

interface ViewModeToggleProps {
  viewMode: "text" | "icon"
  onViewModeChange: (mode: "text" | "icon") => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative inline-flex gap-1 p-1 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-full shadow-lg">
      {/* Active indicator */}
      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 50%, #4a4a4a 100%)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          transform: viewMode === "icon" ? "translateX(calc(100% + 4px))" : "translateX(0)",
        }}
      />

      {/* Text button */}
      <button
        onClick={() => onViewModeChange("text")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-10 flex items-center justify-center w-20 h-10 rounded-full transition-all duration-200 cursor-pointer"
        style={{
          color: viewMode === "text" ? "#1a1a1a" : "#666666",
        }}
      >
        <Type size={18} strokeWidth={2} />
      </button>

      {/* Icon button */}
      <button
        onClick={() => onViewModeChange("icon")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-10 flex items-center justify-center w-20 h-10 rounded-full transition-all duration-200 cursor-pointer"
        style={{
          color: viewMode === "icon" ? "#1a1a1a" : "#666666",
        }}
      >
        <Sparkles size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
