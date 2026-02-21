"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { signTransaction } from "@stellar/freighter-api"
import { Networks } from "@stellar/stellar-sdk"
import { useAccount } from "@/hooks/use-account"
import { useSoroSwap } from "@/hooks/use-soroswap"
import { useBalance } from "@/hooks/use-balance"
import { ConnectButton } from "./connect-button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Mainnet only. */
const ASSETS = {
  XLM: {
    symbol: "XLM",
    name: "Stellar Lumens",
    contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
    decimals: 7,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    decimals: 7,
  },
} as const

type Asset = {
  symbol: string
  name: string
  contractId: string
  decimals: number
}

export function SwapInterface() {
  const { account } = useAccount()
  const { getQuote, buildSwap, submitSwap, isLoading: soroSwapLoading } = useSoroSwap()
  const { getBalance, refetch: refetchBalances, isLoading: balanceLoading } = useBalance()
  const [fromAsset, setFromAsset] = useState<Asset>(ASSETS.XLM as Asset)
  const [toAsset, setToAsset] = useState<Asset>(ASSETS.USDC as Asset)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [slippage, setSlippage] = useState("0.5")


  // Swap the from/to assets
  const handleSwapAssets = () => {
    const tempAsset = fromAsset
    const tempAmount = fromAmount
    setFromAsset(toAsset)
    setToAsset(tempAsset)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    setQuote(null)
  }

  // Get quote when amount changes
  useEffect(() => {
    if (!fromAmount || !account || parseFloat(fromAmount) <= 0) {
      setToAmount("")
      setQuote(null)
      return
    }

    const fetchQuote = async () => {
      try {
        setIsLoading(true)
        
        // Convert amount to raw units (round to avoid float precision, e.g. 0.00000001 -> "0.1")
        const rawAmount = Math.round(parseFloat(fromAmount) * Math.pow(10, fromAsset.decimals)).toString()
        
        const fromAssetData = { contractId: fromAsset.contractId }
        const toAssetData = { contractId: toAsset.contractId }
        
        const quoteResult = await getQuote(fromAssetData, toAssetData, rawAmount, "mainnet")
        
        // Convert back from raw units to display units
        const expectedOutDisplay = (parseFloat(quoteResult.expectedOut) / Math.pow(10, toAsset.decimals)).toFixed(6)
        const minOutDisplay = (parseFloat(quoteResult.minOut) / Math.pow(10, toAsset.decimals)).toFixed(6)
        
        setToAmount(expectedOutDisplay)
        setQuote({
          ...quoteResult,
          expectedOut: expectedOutDisplay,
          minOut: minOutDisplay,
          priceImpact: "< 0.1%"
        })
      } catch (error) {
        console.error("Quote error:", error)
        toast.error("Failed to get quote", {
          description: error instanceof Error ? error.message : "Please try again"
        })
        setToAmount("")
        setQuote(null)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchQuote, 800)
    return () => clearTimeout(debounce)
  }, [fromAmount, fromAsset, toAsset, slippage, account])

  const handleSwap = async () => {
    if (!account || !quote || !fromAmount) return

    try {
      setIsLoading(true)
      const network = "mainnet"

      // 1) Build unsigned transaction (server)
      const { xdr } = await buildSwap(quote, account.publicKey, network)

      // 2) Sign with Freighter – user approves in the wallet popup
      const networkPassphrase = Networks.PUBLIC
      const signResult = await signTransaction(xdr, { networkPassphrase })
      if (signResult.error) {
        if (signResult.error.message?.toLowerCase().includes("rejected") || signResult.error.message?.toLowerCase().includes("denied")) {
          toast.info("Swap cancelled")
        } else {
          toast.error("Wallet signing failed", { description: signResult.error.message })
        }
        return
      }
      if (!signResult.signedTxXdr) {
        toast.error("Wallet did not return a signed transaction")
        return
      }

      // 3) Submit signed transaction (server)
      const result = await submitSwap(signResult.signedTxXdr, network)

      toast.success("Swap executed successfully!", {
        description: `Transaction hash: ${result.hash.slice(0, 8)}...`
      })

      setFromAmount("")
      setToAmount("")
      setQuote(null)
      refetchBalances()
    } catch (error) {
      console.error("Swap error:", error)
      const msg = error instanceof Error ? error.message : "Unknown error occurred"
      const isApiKeyError =
        msg.includes("SOROSWAP_API_KEY") ||
        msg.includes("required to build")
      toast.error(isApiKeyError ? "Build requires API key" : "Swap failed", {
        description: isApiKeyError
          ? "Set SOROSWAP_API_KEY in the server .env to enable swap execution (quote still works without it)."
          : msg
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <div className="relative rounded-2xl border border-zinc-800 p-3">
        <GlowingEffect
          blur={0}
          borderWidth={2}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative bg-(#0a0a0a) rounded-xl p-8 text-center">
          <h3 className="text-2xl font-light mb-4">Connect Wallet</h3>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Connect your wallet to start swapping tokens on Stellar.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border border-zinc-800 p-3">
      <GlowingEffect
        blur={0}
        borderWidth={2}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative bg-(#0a0a0a) rounded-xl p-8">
        {/* From Asset */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">From</span>
            <span className="text-zinc-400">
              Balance: {balanceLoading ? "..." : getBalance(fromAsset.symbol, fromAsset.symbol === "USDC" ? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" : null)}
            </span>
          </div>
          
          <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-2xl font-light text-white placeholder:text-zinc-500 p-0 h-auto focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-zinc-800 px-3 py-2 h-auto rounded-xl">
                    <span className="font-medium">{fromAsset.symbol}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-950 border-zinc-800">
                  {Object.values(ASSETS).map((asset) => (
                    <DropdownMenuItem
                      key={asset.symbol}
                      onClick={() => setFromAsset(asset)}
                      className="text-white hover:bg-zinc-800 cursor-pointer"
                    >
                      
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-zinc-400">{asset.name}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="my-6"></div>

        {/* To Asset */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">To</span>
            <span className="text-zinc-400">
              Balance: {balanceLoading ? "..." : getBalance(toAsset.symbol, toAsset.symbol === "USDC" ? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" : null)}
            </span>
          </div>
          
          <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="border-0 bg-transparent text-2xl font-light text-white placeholder:text-zinc-500 p-0 h-auto focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-zinc-800 px-3 py-2 h-auto rounded-xl">
                    <span className="font-medium">{toAsset.symbol}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-950 border-zinc-800">
                  {Object.values(ASSETS).map((asset) => (
                    <DropdownMenuItem
                      key={asset.symbol}
                      onClick={() => setToAsset(asset)}
                      className="text-white hover:bg-zinc-800 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-zinc-400">{asset.name}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 mb-6 space-y-3">
            {(quote as { protocol?: string | string[] }).protocol && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Route</span>
                <span className="text-white capitalize">
                  {Array.isArray((quote as { protocol?: string | string[] }).protocol)
                    ? (quote as { protocol: string[] }).protocol.join(" → ")
                    : (quote as { protocol: string }).protocol}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Rate</span>
              <span className="text-white">
                1 {fromAsset.symbol} = {(parseFloat(quote.expectedOut) / parseFloat(quote.expectedIn)).toFixed(6)} {toAsset.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Minimum received</span>
              <span className="text-white">{quote.minOut} {toAsset.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Price impact</span>
              <span className="text-green-400">{quote.priceImpact}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Slippage tolerance</span>
              <span className="text-white">{slippage}%</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          className="w-full rounded-full h-11 font-semibold"
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || isLoading || soroSwapLoading || parseFloat(fromAmount) <= 0}
        >
          {isLoading || soroSwapLoading ? "Getting quote..." : "Swap"}
        </Button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            Powered by SoroSwap · Routes: SoroSwap, Phoenix, Aqua
          </p>
        </div>
      </div>
    </div>
  )
}