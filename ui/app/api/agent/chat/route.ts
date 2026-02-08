import { NextRequest, NextResponse } from "next/server"
import { getNetworkConfig } from "@/lib/agent-kit/config/networks"
import { StellarClient } from "@/lib/agent-kit/core/stellarClient"
import { SoroSwapClient } from "@/lib/agent-kit/defi/soroSwapClient"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"

const MAINNET_XLM = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
const MAINNET_USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> }
  | { role: "tool"; tool_call_id: string; content: string }

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

async function runTool(name: string, args: Record<string, unknown>): Promise<string> {
  const config = getNetworkConfig()
  try {
    if (name === "check_balance") {
      const address = String(args.address ?? "").trim()
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
      const amount = String(args.amount ?? "").trim()
      const fromId = fromAsset === "XLM" ? MAINNET_XLM : fromAsset === "USDC" ? MAINNET_USDC : null
      const toId = toAsset === "XLM" ? MAINNET_XLM : toAsset === "USDC" ? MAINNET_USDC : null
      if (!fromId || !toId) {
        return JSON.stringify({ error: "Use XLM or USDC for fromAsset and toAsset on mainnet." })
      }
      const apiKey = process.env.SOROSWAP_API_KEY
      const client = new SoroSwapClient(config, apiKey)
      const quote = await client.getQuote(
        { contractId: fromId },
        { contractId: toId },
        amount
      )
      return JSON.stringify({
        fromAsset,
        toAsset,
        amount,
        expectedOut: quote.expectedOut,
        minOut: quote.minOut,
        route: quote.route,
        protocol: quote.protocol,
        note: "To execute the swap, use the Swap tab and connect your wallet.",
      })
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return JSON.stringify({ error: msg })
  }
}

async function groqChat(
  apiKey: string,
  messages: ChatMessage[],
  toolChoice: "auto" | "none" = "auto"
): Promise<{ message: ChatMessage; content: string | null; tool_calls?: ChatMessage extends { tool_calls?: infer T } ? T : never }> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    tools: TOOLS,
    tool_choice: toolChoice,
  }
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Groq API error ${res.status}: ${t}`)
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
  apiKey: string,
  messages: ChatMessage[],
  assistantMessage: ChatMessage
): Promise<string> {
  if (!assistantMessage.tool_calls?.length) {
    return assistantMessage.content ?? "No response."
  }
  const current: ChatMessage[] = [...messages, assistantMessage]
  for (const tc of assistantMessage.tool_calls) {
    let args: Record<string, unknown> = {}
    try {
      args = JSON.parse(tc.function.arguments) as Record<string, unknown>
    } catch {
      args = {}
    }
    const result = await runTool(tc.function.name, args)
    current.push({ role: "tool", tool_call_id: tc.id, content: result })
  }
  const next = await groqChat(apiKey, current)
  const nextMsg = next.message as ChatMessage
  return executeAgentTurn(apiKey, current, nextMsg)
}

/**
 * POST /api/agent/chat
 * Body: { messages: ChatMessage[] }
 * Returns: { content: string } or { error: string }
 * Requires GROQ_API_KEY in env.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Agent requires GROQ_API_KEY. Set it in environment." },
        { status: 503 }
      )
    }
    const { messages } = (await request.json()) as { messages?: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Body must include messages array with at least one message." },
        { status: 400 }
      )
    }
    const response = await groqChat(apiKey, messages)
    const assistantMessage = response.message as ChatMessage
    if (response.tool_calls?.length) {
      const final = await executeAgentTurn(apiKey, messages, assistantMessage)
      return NextResponse.json({ content: final })
    }
    return NextResponse.json({ content: assistantMessage.content ?? "No response." })
  } catch (error) {
    console.error("Agent chat error:", error)
    const message = error instanceof Error ? error.message : "Agent failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
