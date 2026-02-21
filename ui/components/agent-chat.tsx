"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, ChevronDown, ArrowUp, X } from "lucide-react"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { signTransaction } from "@stellar/freighter-api"
import { Networks } from "@stellar/stellar-sdk"
import { useAccount } from "@/hooks/use-account"
import { useSoroSwap } from "@/hooks/use-soroswap"
import { toast } from "sonner"

type Message = { role: "user" | "assistant"; content: string }

/** Quote returned by the agent when it ran get_swap_quote (for Execute button). */
type AgentQuote = {
  expectedIn: string
  expectedOut: string
  minOut: string
  route: string[]
  rawData?: unknown
}

export function AgentChat() {
  const { account } = useAccount()
  const { buildSwap, submitSwap, isLoading: swapLoading } = useSoroSwap()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [pendingQuote, setPendingQuote] = useState<AgentQuote | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setError(null)
    setPendingQuote(null)
    const userMessage: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    try {
      const chatMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          publicAddress: account?.publicKey ?? undefined,
        }),
      })
      const data = (await res.json()) as {
        content?: string
        error?: string
        quote?: AgentQuote
      }
      if (!res.ok) {
        throw new Error(data.error || `Request failed: ${res.status}`)
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "No response." },
      ])
      if (data.quote) setPendingQuote(data.quote)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const executePendingSwap = async () => {
    if (!account || !pendingQuote) return
    try {
      const network = "mainnet"
      const { xdr } = await buildSwap(pendingQuote, account.publicKey, network)
      const networkPassphrase = Networks.PUBLIC
      const signResult = await signTransaction(xdr, { networkPassphrase })
      if (signResult.error) {
        if (
          signResult.error.message?.toLowerCase().includes("rejected") ||
          signResult.error.message?.toLowerCase().includes("denied")
        ) {
          toast.info("Swap cancelled")
        } else {
          toast.error("Signing failed", { description: signResult.error.message })
        }
        return
      }
      if (!signResult.signedTxXdr) {
        toast.error("Wallet did not return a signed transaction")
        return
      }
      const result = await submitSwap(signResult.signedTxXdr, network)
      toast.success("Swap executed", { description: `Tx: ${result.hash.slice(0, 8)}...` })
      setPendingQuote(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("Swap failed", { description: msg })
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Centered title - only when no messages, else compact */}
      {!hasMessages ? (
        <div className="shrink-0 text-center pt-8 sm:pt-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">
            What do you want to do?
          </h1>
        </div>
      ) : null}

      {/* Messages area - scrollable when we have messages */}
      {hasMessages && (
        <div className="overflow-y-auto space-y-4 max-h-[50vh] rounded-xl">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-zinc-600 text-white"
                    : "bg-zinc-800/90 text-zinc-200 border border-zinc-700"
                }`}
              >
                <div className="whitespace-pre-wrap wrap-break-word">{m.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-2.5 text-sm bg-zinc-800/90 text-zinc-400 border border-zinc-700">
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Main input box - v0 style: one big rounded box with embedded controls */}
      <div className="shrink-0 w-full">
        <form
          className="rounded-2xl border border-zinc-700 bg-zinc-900/50 shadow-lg overflow-hidden flex flex-col min-h-[140px]"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={
              account
                ? "Ask for balance or swap (e.g. swap 1 XLM for USDC)..."
                : "Connect your wallet so the agent can use your address, or ask for a quote..."
            }
            className="w-full flex-1 min-h-[88px] resize-none bg-transparent px-4 pt-4 pb-2 text-white placeholder:text-zinc-500 focus:outline-none text-sm sm:text-base"
            disabled={loading}
            rows={3}
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400">
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                aria-label="Add"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-colors text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-white font-medium">DeFi Agent</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <LiquidMetalButton
              type="submit"
              viewMode="icon"
              disabled={loading || !input.trim()}
              width={46}
              className="shrink-0"
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </LiquidMetalButton>
          </div>
        </form>
      </div>

      {/* Approve swap: show when agent returned a quote and user is connected */}
      {pendingQuote && account && (
        <div className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-zinc-300">
            Quote ready. Approve in your wallet to execute the swap.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingQuote(null)}
              className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Dismiss
            </button>
            <LiquidMetalButton
              label={swapLoading ? "Building…" : "Approve swap"}
              onClick={executePendingSwap}
              disabled={swapLoading}
              width={140}
            />
          </div>
        </div>
      )}

      {/* Error strip */}
      {error && (
        <div className="shrink-0 px-3 py-2 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Bottom banner - upgrade / GROQ hint */}
      {!bannerDismissed && (
        <div className="shrink-0 rounded-t-2xl bg-zinc-900/80 border border-zinc-800 border-b-0 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">
            Set <code className="text-zinc-300 bg-zinc-800 px-1 rounded">GROQ_API_KEY</code> in your environment to use the agent.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="/docs"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Docs
            </a>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
