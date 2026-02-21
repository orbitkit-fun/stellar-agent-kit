"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { Input } from "@/components/ui/input"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { signTransaction } from "@stellar/freighter-api"
import { Networks } from "@stellar/stellar-sdk"
import { useAccount } from "@/hooks/use-account"
import { ConnectButton } from "./connect-button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

/** Mainnet only. */
const ASSETS = [
  { symbol: "XLM", name: "Stellar Lumens" },
  { symbol: "USDC", name: "USD Coin" },
] as const

const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"

export function SendInterface() {
  const { account } = useAccount()
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState<{ symbol: string; name: string }>(ASSETS[0])
  const [isLoading, setIsLoading] = useState(false)

  const buildPayment = async (): Promise<{ xdr: string }> => {
    const res = await fetch("/api/send/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromAddress: account!.publicKey,
        to: toAddress.trim(),
        amount: amount.trim(),
        assetCode: asset.symbol === "XLM" ? undefined : asset.symbol,
        assetIssuer: asset.symbol === "USDC" ? USDC_ISSUER_MAINNET : undefined,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || `Build failed ${res.status}`)
    }
    return res.json()
  }

  const submitPayment = async (signedXdr: string): Promise<{ hash: string }> => {
    const res = await fetch("/api/send/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedXdr }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || `Submit failed ${res.status}`)
    }
    const data = await res.json()
    return { hash: data.hash }
  }

  const handleSend = async () => {
    if (!account || !toAddress.trim() || !amount || parseFloat(amount) <= 0) return

    try {
      setIsLoading(true)
      const { xdr } = await buildPayment()
      const networkPassphrase = Networks.PUBLIC
      const signResult = await signTransaction(xdr, { networkPassphrase })
      if (signResult.error) {
        if (signResult.error.message?.toLowerCase().includes("rejected")) {
          toast.info("Send cancelled")
        } else {
          toast.error("Signing failed", { description: signResult.error.message })
        }
        return
      }
      if (!signResult.signedTxXdr) {
        toast.error("Wallet did not return a signed transaction")
        return
      }
      const { hash } = await submitPayment(signResult.signedTxXdr)
      toast.success("Payment sent!", { description: `Tx: ${hash.slice(0, 8)}...` })
      setToAddress("")
      setAmount("")
    } catch (error) {
      console.error("Send error:", error)
      toast.error("Send failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <div className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-800 p-3">
        <GlowingEffect blur={0} borderWidth={2} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative bg-(#0a0a0a) rounded-xl p-8 text-center overflow-hidden">
          <h3 className="text-2xl font-light mb-4">Connect Wallet</h3>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Connect your wallet to send XLM or USDC on Stellar.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-800 p-3">
      <GlowingEffect blur={0} borderWidth={2} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
      <div className="relative bg-(#0a0a0a) rounded-xl p-8 overflow-hidden">
        <div className="space-y-3 mb-6">
          <span className="text-zinc-400 text-sm">Recipient (G...)</span>
          <Input
            placeholder="G..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <div className="space-y-3 mb-6">
          <span className="text-zinc-400 text-sm">Amount</span>
          <div className="flex gap-2 min-w-0">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 flex-1 min-w-0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-zinc-800 px-3 py-2 h-auto rounded-xl border border-zinc-800 shrink-0">
                  {asset.symbol}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-950 border-zinc-800">
                {ASSETS.map((a) => (
                  <DropdownMenuItem
                    key={a.symbol}
                    onClick={() => setAsset(a)}
                    className="text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    {a.symbol} — {a.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <LiquidMetalButton
          label={isLoading ? "Sending..." : "Send"}
          onClick={handleSend}
          disabled={!toAddress.trim() || !amount || isLoading || parseFloat(amount) <= 0}
          fullWidth
        />
      </div>
    </div>
  )
}
