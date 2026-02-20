"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"
import { MagicCard } from "@/components/ui/magic-card"
import type { SwapResult } from "@/types"

interface TransactionResultProps {
  result: SwapResult
}

export function TransactionResult({ result }: TransactionResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (result.txHash) {
      await navigator.clipboard.writeText(result.txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <MagicCard
      gradientSize={300}
      gradientFrom={result.success ? "oklch(0.5 0.2 145)" : "oklch(0.5 0.2 25)"}
      gradientTo={result.success ? "oklch(0.4 0.15 145)" : "oklch(0.4 0.15 25)"}
      gradientColor={result.success ? "oklch(0.5 0.2 145)" : "oklch(0.5 0.2 25)"}
      gradientOpacity={0.15}
      className="rounded-2xl"
    >
      <div className={`rounded-2xl border p-6 backdrop-blur-xl ${
        result.success
          ? "border-green-500/20 bg-green-500/5"
          : "border-red-500/20 bg-red-500/5"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-2 ${
            result.success ? "bg-green-500/10" : "bg-red-500/10"
          }`}>
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
          </div>

          <div className="flex-1">
            <h3 className={`font-sans text-lg font-medium ${
              result.success ? "text-green-600" : "text-red-600"
            }`}>
              {result.success ? "Swap Successful!" : "Swap Failed"}
            </h3>

            {result.success && result.txHash ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-foreground/60">
                    Transaction:
                  </p>
                  <code className="font-mono text-sm text-foreground">
                    {formatHash(result.txHash)}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-foreground/40 hover:text-foreground/60"
                    title="Copy hash"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  {result.explorerUrl && (
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/40 hover:text-foreground/60"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {result.outAmount && (
                  <p className="font-mono text-sm text-foreground/60">
                    Received: <span className="text-foreground">{result.outAmount}</span>
                  </p>
                )}

                {result.network && (
                  <p className="font-mono text-xs text-foreground/40">
                    Network: {result.network === "mainnet" ? "Mantle Mainnet" : "Mantle Sepolia"}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 font-mono text-sm text-red-500/80">
                {result.error || "An unknown error occurred"}
              </p>
            )}
          </div>
        </div>
      </div>
    </MagicCard>
  )
}
