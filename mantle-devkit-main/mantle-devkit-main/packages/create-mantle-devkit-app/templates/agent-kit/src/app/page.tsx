"use client"

import { useState, useEffect } from "react"
import { Wallet, ArrowLeftRight, Zap } from "lucide-react"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { SwapForm } from "@/components/swap-form"

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [network, setNetwork] = useState<string>("mainnet")

  useEffect(() => {
    // Get network from environment
    const envNetwork = process.env.NEXT_PUBLIC_NETWORK || "mainnet"
    setNetwork(envNetwork)

    // Check if wallet is already connected
    checkWalletConnection()

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
        } else {
          setWalletAddress(null)
        }
      })
    }
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        }) as string[]
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this app")
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[]

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])

        // Switch to Mantle network
        const chainId = network === "mainnet" ? "0x1388" : "0x138b" // 5000 or 5003
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          })
        } catch (switchError: any) {
          // Network not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                network === "mainnet"
                  ? {
                      chainId: "0x1388",
                      chainName: "Mantle",
                      nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
                      rpcUrls: ["https://rpc.mantle.xyz"],
                      blockExplorerUrls: ["https://explorer.mantle.xyz"],
                    }
                  : {
                      chainId: "0x138b",
                      chainName: "Mantle Sepolia",
                      nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
                      rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
                      blockExplorerUrls: ["https://sepolia.mantlescan.xyz"],
                    },
              ],
            })
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <GrainOverlay />

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
            <img src="/X402.png" alt="X402" className="h-full w-full object-contain" />
          </div>
          <span className="font-sans text-sm font-semibold tracking-tight text-foreground">Demo</span>
        </div>

        <div className="flex items-center gap-3">
          {walletAddress ? (
            <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 backdrop-blur-xl">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-mono text-sm text-foreground">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <MagneticButton variant="secondary" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </MagneticButton>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col justify-center px-6 pt-24 md:px-12">
        <div className="mx-auto max-w-6xl w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left - Text Content */}
            <div>
              <BlurFade delay={0} direction="up" offset={10} blur="4px">
                <div className="mb-4 inline-block w-fit rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 backdrop-blur-md">
                  <p className="font-mono text-xs text-foreground/90">DeFi Swaps on Mantle {network === "mainnet" ? "Mainnet" : "Sepolia"}</p>
                </div>
              </BlurFade>

              <BlurFade delay={0.2} direction="up" offset={20} blur="6px">
                <h1 className="mb-6 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                  <span className="text-balance">
                    Token Swaps
                    <br />
                    with Agent Kit
                  </span>
                </h1>
              </BlurFade>

              <BlurFade delay={0.3} direction="up" offset={15} blur="4px">
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-foreground/80 md:text-xl">
                  <span className="text-pretty">
                    Execute token swaps using Agni Finance, Merchant Moe, or OpenOcean DEX aggregator. Built with Mantle Agent Kit.
                  </span>
                </p>
              </BlurFade>

              <BlurFade delay={0.4} direction="up" offset={10} blur="4px">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {!walletAddress ? (
                    <MagneticButton size="lg" variant="primary" onClick={connectWallet} disabled={isConnecting}>
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </MagneticButton>
                  ) : null}
                  <MagneticButton 
                    size="lg" 
                    variant="secondary" 
                    onClick={() => window.open("https://mantle-devkit.vercel.app/docs-demo", "_blank")}
                    className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/30 whitespace-nowrap"
                  >
                    View Docs
                  </MagneticButton>
                  <MagneticButton 
                    size="lg" 
                    variant="secondary" 
                    onClick={() => window.open("https://mantle-devkit.vercel.app", "_blank")}
                    className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/30 whitespace-nowrap"
                  >
                    Visit Mantle DevKit
                  </MagneticButton>
                </div>
              </BlurFade>
            </div>

            {/* Right - Swap Form */}
            <div className="relative z-10">
              <BlurFade delay={0.4} direction="right" offset={20} blur="8px">
                <SwapForm network={network} walletAddress={walletAddress} />
              </BlurFade>
            </div>
          </div>

          {/* How It Works */}
          <BlurFade delay={0.7} direction="up" offset={10} blur="4px">
            <div className="mt-12 mb-12 relative -z-10">
              <MagicCard
                gradientSize={300}
                gradientFrom="oklch(0.4 0.1 240)"
                gradientTo="oklch(0.35 0.08 240)"
                gradientColor="oklch(0.4 0.1 240)"
                gradientOpacity={0.1}
                className="rounded-2xl relative -z-10"
              >
                <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                  <h3 className="mb-4 text-sm font-medium text-foreground">How It Works</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">1</span>
                      <p className="text-sm text-foreground/70">Connect MetaMask on Mantle {network === "mainnet" ? "Mainnet" : "Sepolia"}</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">2</span>
                      <p className="text-sm text-foreground/70">Select tokens and enter the amount you want to swap</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">3</span>
                      <p className="text-sm text-foreground/70">Confirm the transaction and execute your swap</p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-foreground/50">
          Built with Mantle DevKit
        </div>
      </footer>
    </main>
  )
}
