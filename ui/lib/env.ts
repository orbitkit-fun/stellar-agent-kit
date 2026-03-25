import { pickEnv, readEnv, validateEnv } from "../../packages/stellar-agent-kit/src/config/env"

export type UiLlmProvider = "groq" | "openai"

export function getUiLlmEnv(context: string): {
  provider: UiLlmProvider
  apiKey: string
} {
  validateEnv({
    context,
    oneOf: [["GROQ_API_KEY", "OPENAI_API_KEY"]],
  })

  const groqApiKey = readEnv(process.env, "GROQ_API_KEY")
  if (groqApiKey) {
    return { provider: "groq", apiKey: groqApiKey }
  }

  return {
    provider: "openai",
    apiKey: pickEnv(process.env, ["OPENAI_API_KEY"])!,
  }
}

export function getSupabaseAdminEnv(
  context = "UI Supabase admin client"
): {
  url: string
  serviceRoleKey: string
} | null {
  const url = readEnv(process.env, "NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = readEnv(process.env, "SUPABASE_SERVICE_ROLE_KEY")

  if (!url && !serviceRoleKey) {
    return null
  }

  validateEnv({
    context,
    required: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  })

  return {
    url: readEnv(process.env, "NEXT_PUBLIC_SUPABASE_URL")!,
    serviceRoleKey: readEnv(process.env, "SUPABASE_SERVICE_ROLE_KEY")!,
  }
}
