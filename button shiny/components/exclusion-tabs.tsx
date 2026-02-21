"use client"

import { useMemo } from "react"
import { useWindowSize } from "@/hooks/use-window-size"
import { motion } from "framer-motion"
import { useSafariDetection } from "@/hooks/use-detect-safari"

const tabItems = ["Text", "Icon"]

interface ExclusionTabsProps {
  viewMode: "text" | "icon"
  onViewModeChange: (mode: "text" | "icon") => void
}

export default function ExclusionTabs({ viewMode, onViewModeChange }: ExclusionTabsProps) {
  const isSafari = useSafariDetection()
  const { width = 0 } = useWindowSize()
  const isMobile = useMemo(() => width <= 768, [width])
  const activeTab = viewMode === "text" ? 0 : 1

  const handleTabClick = (index: number) => {
    onViewModeChange(index === 0 ? "text" : "icon")
  }

  if (isSafari) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>
          Some interactive elements are not available in Safari due to compatibility issues. Please try another browser
          for the full experience.
        </p>
      </div>
    )
  }
  return (
    <div className="relative">
      <div className="flex justify-center" style={{ filter: "url(#gooeyTabsFilter)" }}>
        {tabItems.map((item, index) => (
          <motion.button
            key={index}
            animate={{
              margin: activeTab === index ? (isMobile ? "0 20px" : "0 24px") : "0",
              background:
                activeTab === index
                  ? "linear-gradient(135deg, rgb(180, 180, 180) 0%, rgb(120, 120, 120) 50%, rgb(80, 80, 80) 100%)"
                  : "rgb(30, 30, 30)",
            }}
            transition={{
              background: {
                type: "spring",
                bounce: 0,
                duration: 0.3,
                delay: 0.1,
              },
              type: "spring",
              bounce: 0.2,
              duration: 1.2,
            }}
            className="relative overflow-hidden px-4 py-2 text-sm text-white font-semibold tracking-tight focus:outline-hidden md:text-base"
            onClick={() => handleTabClick(index)}
          >
            <span>{item}</span>
          </motion.button>
        ))}
      </div>
      <svg className="absolute -z-10" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooeyTabsFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur-sm" />
            <feColorMatrix
              in="blur-sm"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 36 -18"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
