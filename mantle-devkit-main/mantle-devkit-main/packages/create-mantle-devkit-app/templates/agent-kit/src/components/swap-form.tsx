"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowDown, Loader2, Settings, ChevronDown, Check, AlertCircle } from "lucide-react"
import { MagicCard } from "@/components/ui/magic-card"
import { TransactionResult } from "@/components/transaction-result"
import { TOKENS, FEE_TIERS, PROTOCOLS, getTokensByNetwork } from "@/lib/tokens"
import type { SwapResult, Token } from "@/types"

// Token images mapping (using local files and CDN)
const TOKEN_IMAGES: Record<string, string> = {
  MNT: "/mnt-token.png",
  WMNT: "/mnt-token.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  WETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  mETH: "https://assets.coingecko.com/coins/images/33345/small/symbol_transparent_bg.png",
}

// Token color fallbacks
const TOKEN_COLORS: Record<string, string> = {
  MNT: "#00D4FF",
  WMNT: "#00D4FF",
  USDT: "#26A17B",
  USDC: "#2775CA",
  WETH: "#627EEA",
  mETH: "#C99D66",
}

// Protocol logos
const PROTOCOL_IMAGES: Record<string, string> = {
  agni: "/agnifinance.png",
  merchantmoe: "/merchatmoe.jpg",
  openocean: "/openocean.png",
}

// Token Image Component with fallback
function TokenImage({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false)
  const imageUrl = TOKEN_IMAGES[symbol]
  const fallbackColor = TOKEN_COLORS[symbol] || "#666"

  if (hasError || !imageUrl) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white"
        style={{
          width: size,
          height: size,
          backgroundColor: fallbackColor,
          fontSize: size * 0.4,
        }}
      >
        {symbol.charAt(0)}
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size, backgroundColor: fallbackColor }}
      onError={() => setHasError(true)}
    />
  )
}

// Custom Token Selector Component
function TokenSelector({
  value,
  onChange,
  tokens,
  label,
}: {
  value: Token
  onChange: (token: Token) => void
  tokens: Token[]
  label: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-foreground/15 bg-foreground/10 px-3 py-2.5 transition-all hover:bg-foreground/15 hover:border-foreground/25 relative z-10"
      >
        <TokenImage symbol={value.symbol} size={24} />
        <span className="font-mono text-sm font-medium text-foreground">{value.symbol}</span>
        <ChevronDown className={`h-4 w-4 text-foreground/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[9999] mt-2 w-64 rounded-xl border border-foreground/15 bg-background backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="bg-background/95 rounded-xl">
            <div className="px-3 py-2.5 border-b border-foreground/10">
              <p className="font-mono text-xs font-medium text-foreground/70">{label}</p>
            </div>
            <div className="py-1.5">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    onChange(token)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-colors ${
                    value.symbol === token.symbol
                      ? "bg-foreground/10"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <TokenImage symbol={token.symbol} size={32} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-mono text-sm font-medium text-foreground truncate">{token.symbol}</p>
                    <p className="font-mono text-xs text-foreground/50 truncate">{token.name}</p>
                  </div>
                  {value.symbol === token.symbol && (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Protocol Image Component
function ProtocolImage({ protocol }: { protocol: string }) {
  const [hasError, setHasError] = useState(false)
  const imageUrl = PROTOCOL_IMAGES[protocol.toLowerCase()]

  if (hasError || !imageUrl) {
    // Fallback: show first letter of protocol name
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-foreground/10 text-[10px] font-medium text-foreground/60">
        {protocol.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={protocol}
      width={16}
      height={16}
      className="rounded-sm object-contain"
      onError={() => setHasError(true)}
    />
  )
}

interface SwapFormProps {
  network: string
  walletAddress?: string | null
}

export function SwapForm({ network, walletAddress }: SwapFormProps) {
  const [protocol, setProtocol] = useState<"agni" | "merchantmoe" | "openocean">("agni")
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[network]?.MNT || TOKENS.mainnet.MNT)
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[network]?.USDT || TOKENS.mainnet.USDT)
  const [amount, setAmount] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [feeTier, setFeeTier] = useState(500)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SwapResult | null>(null)
  const [quoteAmount, setQuoteAmount] = useState<string | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)

  const tokens = getTokensByNetwork(network)
  const isMainnet = network === "mainnet"

  // Fetch quote when amount or tokens change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || !isMainnet) {
        setQuoteAmount(null)
        return
      }

      setIsLoadingQuote(true)
      try {
        const params = new URLSearchParams({
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amount: amount,
        })

        const response = await fetch(`/api/swap?${params}`)
        const data = await response.json()

        if (response.ok && data.success && data.outAmount) {
          // API returns human-readable amount directly
          const outValue = parseFloat(data.outAmount)
          const formatted = outValue.toLocaleString("en-US", {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
          })
          setQuoteAmount(formatted)
        } else {
          setQuoteAmount(null)
        }
      } catch (error) {
        console.error("Failed to fetch quote:", error)
        setQuoteAmount(null)
      } finally {
        setIsLoadingQuote(false)
      }
    }

    // Debounce quote fetching
    const timeoutId = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timeoutId)
  }, [amount, tokenIn.address, tokenOut.address, isMainnet])

  const handleSwap = async () => {
    if (!walletAddress) {
      setResult({ success: false, error: "Please connect your wallet first" })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setResult({ success: false, error: "Please enter a valid amount" })
      return
    }

    if (!isMainnet) {
      setResult({ success: false, error: "Swaps are only available on Mantle Mainnet" })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Get swap transaction data from API
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol,
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amount,
          slippage,
          feeTier: protocol === "agni" ? feeTier : undefined,
          walletAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ success: false, error: data.error || "Failed to prepare swap" })
        return
      }

      // If API returns transaction data, send it via wallet
      if (data.txData) {
        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: walletAddress,
            to: data.txData.to,
            data: data.txData.data,
            value: data.txData.value || "0x0",
          }],
        })

        // Wait for confirmation
        setResult({
          success: true,
          txHash,
          outAmount: data.outAmount,
          explorerUrl: `https://explorer.mantle.xyz/tx/${txHash}`,
          network: "mainnet",
        })
      } else if (data.txHash) {
        // Fallback if server executed the swap
        setResult({
          success: true,
          txHash: data.txHash,
          outAmount: data.outAmount,
          explorerUrl: data.explorerUrl,
          network: data.network,
        })
      }
    } catch (error: any) {
      // Handle user rejection
      if (error.code === 4001) {
        setResult({ success: false, error: "Transaction rejected by user" })
      } else {
        setResult({
          success: false,
          error: error.message || "Swap failed",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchTokens = () => {
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
  }

  return (
    <div className="space-y-4">
      {/* Mainnet Notice */}
      {!isMainnet && (
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <p className="font-mono text-xs text-yellow-500">
            Swaps require Mantle Mainnet. Please switch networks to trade.
          </p>
        </div>
      )}

      {/* Wallet Notice */}
      {!walletAddress && (
        <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-foreground/60 flex-shrink-0" />
          <p className="font-mono text-xs text-foreground/70">
            Connect your wallet to execute swaps. Transactions will be signed by your wallet.
          </p>
        </div>
      )}

      <MagicCard
        gradientSize={300}
        gradientFrom="oklch(0.35 0.15 240)"
        gradientTo="oklch(0.3 0.13 240)"
        gradientColor="oklch(0.35 0.15 240)"
        gradientOpacity={0.15}
        className="rounded-2xl relative z-10"
      >
        <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-xl relative z-10">
          {/* Protocol Selector */}
          <div className="mb-6">
            <p className="mb-3 font-mono text-xs text-foreground/60">Select Protocol</p>
            <div className="flex gap-2">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProtocol(p.id as any)}
                  disabled={!isMainnet}
                  className={`flex-1 rounded-lg border px-3 py-2.5 font-sans text-sm transition-all flex items-center justify-center gap-2 ${
                    protocol === p.id
                      ? "border-foreground/30 bg-foreground/15 text-foreground"
                      : "border-foreground/10 bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                  } ${!isMainnet ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={p.description}
                >
                  <ProtocolImage protocol={p.id} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* From Token */}
          <div className="mb-2 rounded-xl border border-foreground/10 bg-foreground/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-xs text-foreground/60">You Pay</p>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 min-w-0">
              <TokenSelector
                value={tokenIn}
                onChange={setTokenIn}
                tokens={tokens}
                label="Select token to sell"
              />
              <div className="flex-1 min-w-0 flex justify-end overflow-hidden">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value
                    // Allow only numbers and decimal point
                    const numericValue = value.replace(/[^0-9.]/g, '')
                    // Prevent multiple decimal points
                    const parts = numericValue.split('.')
                    const filteredValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : numericValue
                    setAmount(filteredValue)
                  }}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, decimal point, and numbers
                    if (
                      [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true) ||
                      // Allow: home, end, left, right
                      (e.keyCode >= 35 && e.keyCode <= 39)
                    ) {
                      return
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                      e.preventDefault()
                    }
                  }}
                  placeholder="0.0"
                  className="w-full min-w-0 bg-transparent text-right font-mono text-2xl font-medium text-foreground placeholder:text-foreground/30 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              onClick={handleSwitchTokens}
              className="rounded-full border border-foreground/15 bg-background p-2.5 text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground hover:rotate-180 duration-300"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* To Token */}
          <div className="mt-2 rounded-xl border border-foreground/10 bg-foreground/5 p-4">
            <p className="mb-3 font-mono text-xs text-foreground/60">You Receive</p>
            <div className="flex items-center gap-4 min-w-0">
              <TokenSelector
                value={tokenOut}
                onChange={setTokenOut}
                tokens={tokens}
                label="Select token to buy"
              />
              <div className="flex-1 min-w-0 text-right font-mono text-2xl font-medium text-foreground overflow-hidden">
                {isLoadingQuote ? (
                  <Loader2 className="h-6 w-6 animate-spin text-foreground/40 inline-block" />
                ) : quoteAmount ? (
                  <span className="block truncate">{quoteAmount}</span>
                ) : (
                  <span className="text-foreground/40">~</span>
                )}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/5 p-4">
              <p className="mb-3 font-mono text-xs text-foreground/60">Settings</p>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-xs text-foreground/50">Slippage Tolerance</p>
                  <div className="flex gap-2">
                    {[0.5, 1, 2, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlippage(s)}
                        className={`rounded-lg border px-3 py-1 font-mono text-xs ${
                          slippage === s
                            ? "border-foreground/30 bg-foreground/15 text-foreground"
                            : "border-foreground/10 bg-foreground/5 text-foreground/60"
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                </div>
                {protocol === "agni" && (
                  <div>
                    <p className="mb-2 font-mono text-xs text-foreground/50">Fee Tier</p>
                    <select
                      value={feeTier}
                      onChange={(e) => setFeeTier(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-foreground/10 bg-foreground/10 px-3 py-2 font-mono text-xs text-foreground focus:outline-none"
                    >
                      {FEE_TIERS.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isLoading || !amount || !walletAddress || !isMainnet}
            className="mt-6 w-full rounded-full border border-foreground/20 bg-foreground/95 text-background py-4 font-sans text-sm font-medium transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirm in Wallet...
              </>
            ) : !walletAddress ? (
              "Connect Wallet to Swap"
            ) : !isMainnet ? (
              "Switch to Mainnet"
            ) : (
              "Execute Swap"
            )}
          </button>
        </div>
      </MagicCard>

      {/* Transaction Result */}
      {result && <TransactionResult result={result} />}
    </div>
  )
}
