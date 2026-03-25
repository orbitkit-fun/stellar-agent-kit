import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminEnv } from "@/lib/env"

const supabaseEnv = getSupabaseAdminEnv()

/**
 * Returns a Supabase admin client (service role — bypasses RLS).
 * Only call server-side. Returns null if env vars are not configured.
 */
export function getSupabaseAdmin() {
  if (!supabaseEnv) return null
  return createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type Database = {
  public: {
    Tables: {
      credit_accounts: {
        Row: CreditAccount
        Insert: Omit<CreditAccount, "created_at" | "updated_at">
        Update: Partial<Omit<CreditAccount, "app_id" | "created_at">>
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, "id" | "created_at">
      }
      promo_codes: {
        Row: PromoCode
        Insert: Omit<PromoCode, "id" | "created_at">
      }
    }
  }
}

export type CreditAccount = {
  app_id: string
  balance: number
  plan: "free" | "builder" | "pro"
  monthly_allowance: number
  allowance_reset_at: string
  created_at: string
  updated_at: string
}

export type CreditTransaction = {
  id: string
  app_id: string
  delta: number
  reason: string
  endpoint?: string | null
  created_at: string
}

export type PromoCode = {
  id: string
  code: string
  credits: number
  max_uses: number
  uses: number
  expires_at: string | null
  created_at: string
}
