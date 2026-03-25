import { NextRequest, NextResponse } from "next/server"
import { getUiLlmEnv } from "@/lib/env"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const OPENAI_URL = "https://api.openai.com/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"
const llmEnv = getUiLlmEnv("UI docs assistant API")

const DOCS_SYSTEM = `You are a helpful assistant for Stellar DevKit documentation. Answer questions about:
- stellar-agent-kit: StellarAgentKit, getBalances, sendPayment, createAccount, pathPayment, dexGetQuote, dexSwap, dexSwapExactIn, getPrice (Reflector), lendingSupply/lendingBorrow (Blend). Mainnet only. Initialize with new StellarAgentKit(secretKey, "mainnet") then await agent.initialize().
- x402-stellar-sdk: HTTP 402 payment-gated APIs. Server: x402(options), x402Hono, withX402 (Next). Client: x402Fetch with payWithStellar. Options: price, assetCode, issuer?, network, destination, memo?.
- create-stellar-devkit-app: npx create-stellar-devkit-app [name]. Templates: agent-kit (Next.js + StellarAgentKit), x402-api (Express + paywall).
- stellar-devkit-mcp: MCP server for Cursor/Claude. Tools: get_stellar_contract, get_sdk_snippet, get_quote, list_devkit_methods.
- CLI: balance, pay, agent (interactive with check_balance, get_swap_quote). Env: SECRET_KEY, SOROSWAP_API_KEY, GROQ_API_KEY.
- Networks: mainnet (Horizon, Soroban RPC). Contract addresses: SoroSwap aggregator, Blend pools, Reflector oracles, FxDAO vaults.
Be concise. Cite section names when relevant. If unsure, suggest checking the docs page.`

type Message = { role: "user" | "assistant" | "system"; content: string }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = (body.messages ?? []) as Message[]
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Body must include messages array with at least one message." },
        { status: 400 }
      )
    }
    const url = llmEnv.provider === "groq" ? GROQ_URL : OPENAI_URL
    const model = llmEnv.provider === "groq" ? MODEL : "gpt-4o-mini"
    const payload = {
      model,
      messages: [
        { role: "system" as const, content: DOCS_SYSTEM },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llmEnv.apiKey}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { error: `LLM request failed: ${res.status} ${err}` },
        { status: 502 }
      )
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content ?? "No response."
    return NextResponse.json({ content })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
