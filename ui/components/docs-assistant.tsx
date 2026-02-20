"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string }

export function DocsAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setError(null)
    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await fetch("/api/docs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = (await res.json()) as { content?: string; error?: string }
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
      setMessages((prev) => [...prev, { role: "assistant", content: data.content ?? "No response." }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-zinc-800 bg-zinc-950/80">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-emerald-500" />
        <span className="font-medium text-white text-sm">Docs assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-sm">
            Ask anything about the Stellar DevKit—SDKs, x402, CLI, MCP, or contracts.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "bg-[#5100fd]/20 text-white ml-4"
                : "bg-zinc-800/80 text-zinc-300 mr-2"
            }`}
          >
            {m.content}
          </div>
        ))}
        {error && (
          <p className="text-red-400 text-xs">
            {error.includes("GROQ_API_KEY") || error.includes("OPENAI_API_KEY")
              ? "Set GROQ_API_KEY or OPENAI_API_KEY in env to enable the assistant."
              : error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about the docs..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 p-2 text-white"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
