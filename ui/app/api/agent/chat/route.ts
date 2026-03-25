import { NextRequest, NextResponse } from "next/server"
import { getNetworkConfig } from "@/lib/agent-kit/config/networks"
import { StellarClient } from "@/lib/agent-kit/core/stellarClient"
import { SoroSwapClient } from "@/lib/agent-kit/defi/soroSwapClient"
import { getUiLlmEnv } from "@/lib/env"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const OPENAI_URL = "https://api.openai.com/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"
const llmEnv = getUiLlmEnv("UI agent chat API")

const MAINNET_XLM = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
const MAINNET_USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> }
  | { role: "tool"; tool_call_id: string; content: string }

/** Quote payload returned when the agent ran get_swap_quote (for in-chat Execute). */
export type AgentChatQuote = {
  expectedIn: string
  expectedOut: string
  minOut: string
  route: string[]
  rawData?: unknown
}

const TOOLS: Array<{
  type: "function"
  function: { name: string; description: string; parameters: { type: "object"; properties: Record<string, unknown>; required: string[] } }
}> = [
  {
    type: "function",
    function: {
      name: "check_balance",
      description: "Get token balances for a Stellar address",
      parameters: {
        type: "object",
        properties: { address: { type: "string", description: "Stellar address (G...)" }, network: { type: "string", enum: ["mainnet"] } },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_swap_quote",
      description: "Get swap quote without executing (XLM and USDC on mainnet)",
      parameters: {
        type: "object",
        properties: {
          fromAsset: { type: "string", description: "XLM or USDC" },
          toAsset: { type: "string", description: "XLM or USDC" },
          amount: { type: "string", description: "Amount e.g. 10" },
          network: { type: "string", enum: ["mainnet"] },
        },
        required: ["fromAsset", "toAsset", "amount", "network"],
      },
    },
  },
]

async function runTool(
  name: string,
  args: Record<string, unknown>,
  publicAddress?: string | null
): Promise<string> {
  const config = getNetworkConfig()
  try {
    if (name === "check_balance") {
      let address = String(args.address ?? "").trim()
      if (!address && publicAddress) address = publicAddress.trim()
      if (!address || address.length !== 56 || !address.startsWith("G")) {
        return JSON.stringify({ error: "Invalid Stellar address. Use a 56-character key starting with G." })
      }
      const client = new StellarClient(config)
      const balances = await client.getBalance(address)
      return JSON.stringify({ balances })
    }
    if (name === "get_swap_quote") {
      const fromAsset = String(args.fromAsset ?? "").trim().toUpperCase()
      const toAsset = String(args.toAsset ?? "").trim().toUpperCase()
      const amountStr = String(args.amount ?? "").trim()
      const fromId = fromAsset === "XLM" ? MAINNET_XLM : fromAsset === "USDC" ? MAINNET_USDC : null
      const toId = toAsset === "XLM" ? MAINNET_XLM : toAsset === "USDC" ? MAINNET_USDC : null
      if (!fromId || !toId) {
        return JSON.stringify({ error: "Use XLM or USDC for fromAsset and toAsset on mainnet." })
      }
      // SoroSwap expects amount in raw units (7 decimals for XLM/USDC). LLM usually sends display amount (e.g. "1").
      const amountNum = parseFloat(amountStr)
      const rawAmount =
        Number.isNaN(amountNum) || amountNum <= 0
          ? ""
          : amountStr.length >= 7 && /^\d+$/.test(amountStr)
            ? amountStr
            : Math.round(amountNum * 1e7).toString()
      if (!rawAmount) {
        return JSON.stringify({ error: "Invalid amount. Use a positive number (e.g. 1 for 1 XLM)." })
      }
      const apiKey = process.env.SOROSWAP_API_KEY
      const client = new SoroSwapClient(config, apiKey)
      const quote = await client.getQuote(
        { contractId: fromId },
        { contractId: toId },
        rawAmount
      )
      // Decimals: XLM and Stellar USDC both use 7. Use human-readable amounts so the LLM does not show raw units (e.g. 325718) as "325,718 USDC".
      const fromDecimals = 7
      const toDecimals = 7
      const expectedInHuman = (parseInt(quote.expectedIn, 10) / Math.pow(10, fromDecimals)).toFixed(Math.min(fromDecimals, 7))
      const expectedOutHuman = (parseInt(quote.expectedOut, 10) / Math.pow(10, toDecimals)).toFixed(Math.min(toDecimals, 7))
      const minOutHuman = (parseInt(quote.minOut, 10) / Math.pow(10, toDecimals)).toFixed(Math.min(toDecimals, 7))
      return JSON.stringify({
        fromAsset,
        toAsset,
        amount: amountStr,
        expectedIn: quote.expectedIn,
        expectedOut: quote.expectedOut,
        minOut: quote.minOut,
        expectedInHuman,
        expectedOutHuman,
        minOutHuman,
        route: quote.route,
        protocol: quote.protocol,
        rawData: quote.rawData ?? quote,
        note: "When telling the user the quote, use expectedInHuman and expectedOutHuman (these are in display units, e.g. 0.33 USDC). Do not use expectedIn/expectedOut which are raw smallest units. You can tell the user they can execute this swap with the Approve button below.",
      })
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return JSON.stringify({ error: msg })
  }
}

async function llmChat(
  messages: ChatMessage[],
  toolChoice: "auto" | "none" = "auto"
): Promise<{ message: ChatMessage; content: string | null; tool_calls?: ChatMessage extends { tool_calls?: infer T } ? T : never }> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    tools: TOOLS,
    tool_choice: toolChoice,
  }
  const res = await fetch(llmEnv.provider === "groq" ? GROQ_URL : OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmEnv.apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`LLM API error ${res.status}: ${t}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { role: string; content: string | null; tool_calls?: Array<{ id: string; type: string; function: { name: string; arguments: string } }> } }>
  }
  const msg = data.choices?.[0]?.message
  if (!msg) throw new Error("No message in Groq response")
  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: msg.content ?? null,
    tool_calls: msg.tool_calls?.map((tc) => ({
      id: tc.id,
      type: "function" as const,
      function: { name: tc.function.name, arguments: tc.function.arguments },
    })),
  }
  return {
    message: assistantMessage,
    content: assistantMessage.content ?? null,
    tool_calls: assistantMessage.tool_calls,
  }
}

async function executeAgentTurn(
  messages: ChatMessage[],
  assistantMessage: ChatMessage,
  publicAddress?: string | null
): Promise<{ content: string; quote?: AgentChatQuote }> {
  if (!assistantMessage.tool_calls?.length) {
    return { content: assistantMessage.content ?? "No response." }
  }
  const current: ChatMessage[] = [...messages, assistantMessage]
  let lastQuote: AgentChatQuote | undefined
  for (const tc of assistantMessage.tool_calls) {
    let args: Record<string, unknown> = {}
    try {
      args = JSON.parse(tc.function.arguments) as Record<string, unknown>
    } catch {
      args = {}
    }
    const result = await runTool(tc.function.name, args, publicAddress)
    if (tc.function.name === "get_swap_quote") {
      try {
        const parsed = JSON.parse(result) as Record<string, unknown>
        if (parsed.expectedOut != null && !parsed.error) {
          lastQuote = {
            expectedIn: String(parsed.expectedIn ?? parsed.amount ?? "0"),
            expectedOut: String(parsed.expectedOut),
            minOut: String(parsed.minOut ?? parsed.expectedOut),
            route: Array.isArray(parsed.route) ? (parsed.route as string[]) : [],
            rawData: parsed.rawData,
          }
        }
      } catch {
        /* ignore */
      }
    }
    current.push({ role: "tool", tool_call_id: tc.id, content: result })
  }
  const next = await llmChat(current)
  const nextMsg = next.message as ChatMessage
  const recursive = await executeAgentTurn(current, nextMsg, publicAddress)
  return {
    content: recursive.content,
    quote: recursive.quote ?? lastQuote,
  }
}

/**
 * POST /api/agent/chat
 * Body: { messages: ChatMessage[], publicAddress?: string }
 * Returns: { content: string, quote?: AgentChatQuote } or { error: string }
 * When publicAddress is sent (connected wallet), the agent uses it for balance and swap; optional quote is returned when the agent ran get_swap_quote so the UI can show Approve.
 * Requires GROQ_API_KEY or OPENAI_API_KEY in env.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, publicAddress } = (await request.json()) as {
      messages?: ChatMessage[]
      publicAddress?: string | null
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Body must include messages array with at least one message." },
        { status: 400 }
      )
    }
    const normalizedAddress =
      typeof publicAddress === "string" ? publicAddress.trim() : null
    const hasValidAddress =
      normalizedAddress?.length === 56 && normalizedAddress.startsWith("G")
    const oneToolRule =
      "Call only one tool per response. For swap requests call get_swap_quote only; do not call check_balance in the same response."
    const addressContext = hasValidAddress
      ? ` The user's Stellar public address is ${normalizedAddress}. Use this address when calling check_balance. Do not ask the user for their address.`
      : ""
    const messagesWithContext: ChatMessage[] = [
      {
        role: "system",
        content: oneToolRule + addressContext,
      },
      ...messages,
    ]

    const response = await llmChat(messagesWithContext)
    const assistantMessage = response.message as ChatMessage
    if (response.tool_calls?.length) {
      const result = await executeAgentTurn(
        messagesWithContext,
        assistantMessage,
        normalizedAddress
      )
      return NextResponse.json({ content: result.content, quote: result.quote })
    }
    return NextResponse.json({ content: assistantMessage.content ?? "No response." })
  } catch (error) {
    console.error("Agent chat error:", error)
    const message = error instanceof Error ? error.message : "Agent failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
