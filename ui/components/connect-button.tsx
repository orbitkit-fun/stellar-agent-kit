"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { useAccount } from "@/hooks/use-account"
import { useWallet } from "./wallet-provider"
import { Wallet } from "lucide-react"
import { toast } from "sonner"

interface ConnectButtonProps {
  label?: string
  variant?: "default" | "shiny" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  /** For variant="shiny": button width in px (default from size) */
  width?: number
}

export function ConnectButton({
  label = "Connect Wallet",
  variant = "shiny",
  size = "default",
  className,
  width,
}: ConnectButtonProps) {
  const { connect, isLoading } = useAccount()
  const { isFreighterAvailable } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!isFreighterAvailable) {
      toast.error("Freighter wallet not found", {
        description: "Please install the Freighter wallet extension to continue.",
        action: {
          label: "Install Freighter",
          onClick: () => window.open("https://www.freighter.app/", "_blank"),
        },
      })
      return
    }

    try {
      setIsConnecting(true)
      await connect()
      toast.success("Wallet connected successfully!")
    } catch (error: unknown) {
      console.error("Failed to connect wallet:", error)
      const message = error instanceof Error ? error.message : ""
      if (message?.includes("User declined access")) {
        toast.error("Connection cancelled", {
          description: "You declined the wallet connection request.",
        })
      } else {
        toast.error("Failed to connect wallet", {
          description: "Please try again or check your Freighter wallet.",
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  if (variant === "shiny") {
    const metalWidth = width ?? (size === "lg" ? 180 : size === "sm" ? 120 : 152)
    return (
      <LiquidMetalButton
        label={isConnecting ? "Connecting..." : label}
        onClick={handleConnect}
        disabled={isLoading || isConnecting}
        width={metalWidth}
        className={className}
      />
    )
  }

  return (
    <Button
      variant={variant}
      onClick={handleConnect}
      disabled={isLoading || isConnecting}
      size={size}
      className={className ?? "gap-2 px-5 py-2.5 rounded-full"}
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : label}
    </Button>
  )
}