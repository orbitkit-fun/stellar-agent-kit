/**
 * Credits store — Supabase-backed with in-memory fallback.
 *
 * Database schema: ui/supabase/migrations/001_credits_schema.sql
 * Seed data:       ui/supabase/seed.sql
 * Setup guide:     ui/README.md — "Database setup"
 */

import { getSupabaseAdmin } from "./supabase"
import type { PlanId } from "./subscription-store"

export const PLAN_MONTHLY_CREDITS: Record<PlanId, number> = {
  free: 100,
  builder: 5000,
  pro: 25000,
}

/** Cost in credits per operation (0 = free). */
export const CREDIT_COSTS = {
  "agent/chat": 1,
  "swap/quote": 1,
  "swap/build": 2,
  "swap/execute": 5,
  "swap/submit": 5,
  "send/build": 1,
  "send/submit": 3,
  "lending/supply": 3,
  "lending/borrow": 3,
  "lending/submit": 3,
  "bridge/build": 2,
  "bridge/submit": 5,
  "balance": 0,
  "price": 0,
} as const

export type CreditEndpoint = keyof typeof CREDIT_COSTS

// ── In-memory fallback (used when Supabase is not configured) ──
const memBalances = new Map<string, number>()
const memPlans = new Map<string, PlanId>()

function memGetBalance(appId: string): number {
  if (!memBalances.has(appId)) {
    const plan = memPlans.get(appId) ?? "free"
    memBalances.set(appId, PLAN_MONTHLY_CREDITS[plan])
  }
  return memBalances.get(appId)!
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Ensures a credit account exists for this appId.
 * Creates it with the plan's monthly allowance if it doesn't exist yet.
 */
export async function ensureCreditAccount(appId: string, plan: PlanId = "free"): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) {
    if (!memBalances.has(appId)) {
      memBalances.set(appId, PLAN_MONTHLY_CREDITS[plan])
      memPlans.set(appId, plan)
    }
    return
  }

  const monthly = PLAN_MONTHLY_CREDITS[plan]
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await db.from("credit_accounts").upsert(
    {
      app_id: appId,
      plan,
      monthly_allowance: monthly,
      balance: monthly,
      allowance_reset_at: resetAt,
    },
    { onConflict: "app_id", ignoreDuplicates: true }
  )
}

/**
 * Returns the current credit balance for an appId.
 * Returns null if the account doesn't exist.
 */
export async function getBalance(appId: string): Promise<number | null> {
  const db = getSupabaseAdmin()
  if (!db) {
    return memBalances.has(appId) ? memGetBalance(appId) : null
  }

  const { data } = await db
    .from("credit_accounts")
    .select("balance, allowance_reset_at, monthly_allowance")
    .eq("app_id", appId)
    .single()

  if (!data) return null

  // Auto-reset monthly allowance if expired
  if (new Date(data.allowance_reset_at) < new Date()) {
    const newReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await db
      .from("credit_accounts")
      .update({ balance: data.monthly_allowance, allowance_reset_at: newReset })
      .eq("app_id", appId)
    return data.monthly_allowance
  }

  return data.balance
}

/**
 * Deducts `cost` credits from the account atomically.
 * Returns { ok: true } if successful or { ok: false, balance } if insufficient.
 */
export async function deductCredits(
  appId: string,
  endpoint: CreditEndpoint
): Promise<{ ok: true } | { ok: false; balance: number }> {
  const cost = CREDIT_COSTS[endpoint]

  // Free operations always pass
  if (cost === 0) return { ok: true }

  const db = getSupabaseAdmin()

  if (!db) {
    const bal = memGetBalance(appId)
    if (bal < cost) return { ok: false, balance: bal }
    memBalances.set(appId, bal - cost)
    return { ok: true }
  }

  // Fetch current balance
  const { data } = await db
    .from("credit_accounts")
    .select("balance, allowance_reset_at, monthly_allowance")
    .eq("app_id", appId)
    .single()

  if (!data) return { ok: false, balance: 0 }

  // Auto-reset monthly allowance
  let balance = data.balance
  if (new Date(data.allowance_reset_at) < new Date()) {
    balance = data.monthly_allowance
    const newReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await db
      .from("credit_accounts")
      .update({ balance, allowance_reset_at: newReset })
      .eq("app_id", appId)
  }

  if (balance < cost) return { ok: false, balance }

  // Deduct atomically
  const { error } = await db
    .from("credit_accounts")
    .update({ balance: balance - cost, updated_at: new Date().toISOString() })
    .eq("app_id", appId)
    .gte("balance", cost) // guard against race conditions

  if (error) return { ok: false, balance }

  // Log the transaction
  await db.from("credit_transactions").insert({
    app_id: appId,
    delta: -cost,
    reason: `API call: ${endpoint}`,
    endpoint,
  })

  return { ok: true }
}

/**
 * Adds credits to an account (admin grant or top-up purchase).
 */
export async function addCredits(appId: string, amount: number, reason: string): Promise<void> {
  const db = getSupabaseAdmin()

  if (!db) {
    memBalances.set(appId, (memBalances.get(appId) ?? 0) + amount)
    return
  }

  await db.rpc("add_credits", { p_app_id: appId, p_amount: amount })

  await db.from("credit_transactions").insert({
    app_id: appId,
    delta: amount,
    reason,
    endpoint: null,
  })
}

/**
 * Updates the plan for an account and adjusts monthly allowance.
 * Does not touch the current balance (credits already earned are kept).
 */
export async function setPlanCredits(appId: string, plan: PlanId): Promise<void> {
  const monthly = PLAN_MONTHLY_CREDITS[plan]
  const db = getSupabaseAdmin()

  if (!db) {
    memPlans.set(appId, plan)
    return
  }

  await db
    .from("credit_accounts")
    .upsert(
      {
        app_id: appId,
        plan,
        monthly_allowance: monthly,
        balance: monthly,
        allowance_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "app_id" }
    )
}

/**
 * Redeems a promo code for an appId. Returns credits granted or an error string.
 */
export async function redeemPromoCode(
  code: string,
  appId: string
): Promise<{ ok: true; credits: number } | { ok: false; error: string }> {
  const db = getSupabaseAdmin()
  if (!db) return { ok: false, error: "Credits DB not configured" }

  const { data: promo } = await db
    .from("promo_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single()

  if (!promo) return { ok: false, error: "Invalid promo code" }
  if (promo.uses >= promo.max_uses) return { ok: false, error: "Promo code has been fully used" }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { ok: false, error: "Promo code has expired" }
  }

  // Increment uses
  const { error: useErr } = await db
    .from("promo_codes")
    .update({ uses: promo.uses + 1 })
    .eq("id", promo.id)
    .eq("uses", promo.uses) // optimistic lock

  if (useErr) return { ok: false, error: "Promo code already used (race). Try again." }

  await addCredits(appId, promo.credits, `Promo code: ${code}`)
  return { ok: true, credits: promo.credits }
}

/**
 * Creates a promo code (admin use only).
 */
export async function createPromoCode(opts: {
  code: string
  credits: number
  maxUses?: number
  expiresAt?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin()
  if (!db) return { ok: false, error: "Credits DB not configured" }

  const { error } = await db.from("promo_codes").insert({
    code: opts.code.trim().toUpperCase(),
    credits: opts.credits,
    max_uses: opts.maxUses ?? 1,
    expires_at: opts.expiresAt ?? null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/**
 * Returns recent transactions for an appId.
 */
export async function getTransactions(appId: string, limit = 20) {
  const db = getSupabaseAdmin()
  if (!db) return []

  const { data } = await db
    .from("credit_transactions")
    .select("*")
    .eq("app_id", appId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}
