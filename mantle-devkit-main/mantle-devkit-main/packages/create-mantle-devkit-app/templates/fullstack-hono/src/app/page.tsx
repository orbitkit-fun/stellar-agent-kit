"use client"

import { useState, useEffect } from "react"
import { BrowserProvider } from "ethers"
import { PaymentModal } from "x402-mantle-sdk/client/react"
import type { PaymentRequest, PaymentResponse } from "x402-mantle-sdk/client"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { MagicCard } from "@/components/ui/magic-card"
import { BlurFade } from "@/components/ui/blur-fade"

const API_BASE = ""

interface ApiResponse {
  success?: boolean
  data?: Record<string, unknown>
  message?: string
  endpoints?: Record<string, string>
  error?: string
}

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [pendingEndpoint, setPendingEndpoint] = useState<string | null>(null)

  // Check if wallet is already connected and listen for account changes
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address)
            setProvider(provider)
          }
        } catch (err) {
          console.error("Error checking wallet:", err)
        }
      }
    }
    checkWallet()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[]
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          const provider = new BrowserProvider(window.ethereum!)
          setProvider(provider)
        } else {
          setWalletAddress(null)
          setProvider(null)
        }
      }

      window.ethereum.on?.("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const provider = new BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setWalletAddress(address)
      setProvider(provider)

      // Switch to Mantle Sepolia if needed
      const network = await provider.getNetwork()
      const mantleSepoliaChainId = BigInt(5003)

      if (network.chainId !== mantleSepoliaChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${mantleSepoliaChainId.toString(16)}` }],
          })
        } catch (switchError: unknown) {
          const err = switchError as { code?: number }
          if (err.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${mantleSepoliaChainId.toString(16)}`,
                  chainName: "Mantle Sepolia Testnet",
                  nativeCurrency: {
                    name: "MNT",
                    symbol: "MNT",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
                  blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
                },
              ],
            })
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchEndpoint = async (endpoint: string, name: string) => {
    if (!walletAddress || !window.ethereum) {
      setError("Please connect your wallet first to pay for this endpoint")
      return
    }

    setLoading(name)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE}${endpoint}`)

      if (res.status === 402) {
        let body = {}
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          try {
            const text = await res.text()
            if (text.trim()) {
              body = JSON.parse(text)
            }
          } catch {
            // Ignore JSON parse errors, use empty object
          }
        }

        const amount = res.headers.get("x-402-amount") || body.amount || "0"
        const token = res.headers.get("x-402-token") || body.token || "MNT"
        const network = res.headers.get("x-402-network") || body.network || "mantle-sepolia"
        const recipient = res.headers.get("x-402-recipient") || body.recipient || ""
        const chainId = parseInt(res.headers.get("x-402-chain-id") || String(body.chainId) || "5003")

        setPaymentRequest({
          amount,
          token,
          network,
          recipient,
          chainId,
        })
        setPendingEndpoint(endpoint)
        setShowPaymentModal(true)
        setLoading(null)
        return
      }

      let data = {}
      const contentType = res.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        try {
          const text = await res.text()
          if (text.trim()) {
            data = JSON.parse(text)
          }
        } catch (err) {
          setError("Failed to parse response as JSON")
          return
        }
      } else {
        const text = await res.text()
        data = { message: text || "Request successful" }
      }
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
    } finally {
      setLoading(null)
    }
  }

  const handlePaymentComplete = async (payment: PaymentResponse) => {
    setShowPaymentModal(false)
    setPaymentRequest(null)

    if (!pendingEndpoint) return

    setLoading("confirming")
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setLoading("retrying")
    let lastError = ""

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${API_BASE}${pendingEndpoint}`, {
          headers: {
            "X-402-Transaction-Hash": payment.transactionHash,
          },
        })
        
        let data = {}
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          try {
            const text = await res.text()
            if (text.trim()) {
              data = JSON.parse(text)
            }
          } catch {
            lastError = "Failed to parse response"
            continue
          }
        } else {
          const text = await res.text()
          data = { message: text || "Request successful" }
        }

        if (res.ok) {
          setResponse(data)
          setLoading(null)
          setPendingEndpoint(null)
          return
        }

        lastError = data.error || "Verification failed"

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Request failed"
      }
    }

    setError(`Payment verification failed after 3 attempts: ${lastError}. Transaction: ${payment.transactionHash}`)
    setLoading(null)
    setPendingEndpoint(null)
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setPaymentRequest(null)
    setPendingEndpoint(null)
    setError("Payment cancelled")
  }

  const fetchFree = async (endpoint: string, name: string) => {
    setLoading(name)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE}${endpoint}`)
      
      let data = {}
      const contentType = res.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        try {
          const text = await res.text()
          if (text.trim()) {
            data = JSON.parse(text)
          }
        } catch (err) {
          setError("Failed to parse response as JSON")
          return
        }
      } else {
        const text = await res.text()
        data = { message: text || "Request successful" }
      }
      
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <GrainOverlay />

      {/* Payment Modal from SDK */}
      {paymentRequest && (
        <PaymentModal
          request={paymentRequest}
          isOpen={showPaymentModal}
          onComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
          logo="/X402.png"
          logoAlt="x402"
        />
      )}

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
            <img src="/X402.png" alt="x402" className="h-full w-full object-contain" />
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
                  <p className="font-mono text-xs text-foreground/90">HTTP 402 Demo on Mantle Sepolia</p>
                </div>
              </BlurFade>

              <BlurFade delay={0.2} direction="up" offset={20} blur="6px">
                <h1 className="mb-6 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                  <span className="text-balance">
                    Pay-Per-Request
                    <br />
                    API Demo
                  </span>
                </h1>
              </BlurFade>

              <BlurFade delay={0.3} direction="up" offset={15} blur="4px">
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-foreground/80 md:text-xl">
                  <span className="text-pretty">
                    Experience HTTP 402 payments in action. Connect your wallet, click a paid endpoint, and watch the x402 PaymentModal handle everything automatically.
                  </span>
                </p>
              </BlurFade>

              <BlurFade delay={0.4} direction="up" offset={10} blur="4px">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {!walletAddress ? (
                    <MagneticButton size="lg" variant="primary" onClick={connectWallet} disabled={isConnecting}>
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </MagneticButton>
                  ) : (
                    <MagneticButton size="lg" variant="primary" onClick={() => fetchEndpoint("/api/premium", "premium")} disabled={loading !== null}>
                      {loading === "premium" ? "Processing..." : "Try Premium API"}
                    </MagneticButton>
                  )}
                  <MagneticButton size="lg" variant="secondary" onClick={() => window.open("https://mantle-x402.vercel.app/dashboard?tab=docs", "_blank")} disabled={loading !== null}>
                    docs
                  </MagneticButton>
                </div>
              </BlurFade>
            </div>

            {/* Right - Endpoint Cards */}
            <div className="space-y-4">
              <BlurFade delay={0.4} direction="right" offset={20} blur="8px">
                {/* Free Endpoint Card */}
                <MagicCard
                  gradientSize={300}
                  gradientFrom="oklch(0.5 0.15 150)"
                  gradientTo="oklch(0.4 0.13 150)"
                  gradientColor="oklch(0.5 0.15 150)"
                  gradientOpacity={0.15}
                  className="rounded-2xl mb-4"
                >
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 mb-2">
                          FREE
                        </span>
                        <h3 className="font-mono text-sm text-foreground">GET /api/info</h3>
                        <p className="text-sm text-foreground/60">API information endpoint</p>
                      </div>
                      <MagneticButton
                        variant="secondary"
                        onClick={() => fetchFree("/api/info", "info")}
                        disabled={loading !== null}
                      >
                        {loading === "info" ? "..." : "Fetch"}
                      </MagneticButton>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>

              <BlurFade delay={0.5} direction="right" offset={20} blur="8px">
                {/* Premium Endpoint Card */}
                <MagicCard
                  gradientSize={300}
                  gradientFrom="oklch(0.55 0.2 45)"
                  gradientTo="oklch(0.45 0.18 45)"
                  gradientColor="oklch(0.55 0.2 45)"
                  gradientOpacity={0.15}
                  className="rounded-2xl mb-4"
                >
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 mb-2">
                          0.001 MNT
                        </span>
                        <h3 className="font-mono text-sm text-foreground">GET /api/premium</h3>
                        <p className="text-sm text-foreground/60">Premium secret data</p>
                      </div>
                      <MagneticButton
                        variant="primary"
                        onClick={() => fetchEndpoint("/api/premium", "premium")}
                        disabled={loading !== null || !walletAddress}
                      >
                        {loading === "premium" ? "..." : "Pay"}
                      </MagneticButton>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>

              <BlurFade delay={0.6} direction="right" offset={20} blur="8px">
                {/* Weather Endpoint Card */}
                <MagicCard
                  gradientSize={300}
                  gradientFrom="oklch(0.55 0.15 240)"
                  gradientTo="oklch(0.45 0.13 240)"
                  gradientColor="oklch(0.55 0.15 240)"
                  gradientOpacity={0.15}
                  className="rounded-2xl"
                >
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 mb-2">
                          0.0005 MNT
                        </span>
                        <h3 className="font-mono text-sm text-foreground">GET /api/weather</h3>
                        <p className="text-sm text-foreground/60">Weather forecast data</p>
                      </div>
                      <MagneticButton
                        variant="secondary"
                        onClick={() => fetchEndpoint("/api/weather", "weather")}
                        disabled={loading !== null || !walletAddress}
                      >
                        {loading === "weather" ? "..." : "Pay"}
                      </MagneticButton>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            </div>
          </div>

          {/* Response Display */}
          {(response || error || loading === "confirming" || loading === "retrying") && (
            <BlurFade delay={0} direction="up" offset={10} blur="4px">
              <div className="mt-12">
                <MagicCard
                  gradientSize={400}
                  gradientFrom="oklch(0.35 0.15 240)"
                  gradientTo="oklch(0.3 0.13 240)"
                  gradientColor="oklch(0.35 0.15 240)"
                  gradientOpacity={0.1}
                  className="rounded-2xl"
                >
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                    <h3 className="mb-4 text-sm font-medium text-foreground/60">Response</h3>
                    {loading === "confirming" && (
                      <div className="flex items-center gap-3 text-foreground/80">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/80" />
                        <span>Waiting for transaction confirmation...</span>
                      </div>
                    )}
                    {loading === "retrying" && (
                      <div className="flex items-center gap-3 text-foreground/80">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/80" />
                        <span>Verifying payment...</span>
                      </div>
                    )}
                    {error && !loading && (
                      <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    {response && !loading && (
                      <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-4 font-mono text-sm text-foreground/90">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    )}
                  </div>
                </MagicCard>
              </div>
            </BlurFade>
          )}

          {/* Instructions */}
          <BlurFade delay={0.7} direction="up" offset={10} blur="4px">
            <div className="mt-12 mb-12">
              <MagicCard
                gradientSize={300}
                gradientFrom="oklch(0.4 0.1 240)"
                gradientTo="oklch(0.35 0.08 240)"
                gradientColor="oklch(0.4 0.1 240)"
                gradientOpacity={0.1}
                className="rounded-2xl"
              >
                <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl">
                  <h3 className="mb-4 text-sm font-medium text-foreground">How It Works</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">1</span>
                      <p className="text-sm text-foreground/70">Connect MetaMask on Mantle Sepolia testnet</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">2</span>
                      <p className="text-sm text-foreground/70">Click a paid endpoint and approve the MNT payment</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">3</span>
                      <p className="text-sm text-foreground/70">After verification, the data is returned automatically</p>
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
          Built with x402-mantle-sdk
        </div>
      </footer>
    </main>
  )
}
