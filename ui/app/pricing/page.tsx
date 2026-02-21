"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { Check } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    features: ["Agent Kit basics", "x402 server/client docs", "Community support"],
    cta: "Get started",
    href: "/devkit",
    primary: false,
  },
  {
    id: "builder",
    name: "Builder",
    price: "499",
    currency: "₹",
    period: "/month",
    features: ["Everything in Free", "Pro templates in CLI", "Priority snippets", "Email support"],
    cta: "Upgrade",
    primary: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "999",
    currency: "₹",
    period: "/month",
    features: ["Everything in Builder", "Advanced DEX examples", "Dedicated support", "Early access"],
    cta: "Upgrade",
    primary: false,
  },
]

export default function PricingPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successChecked, setSuccessChecked] = useState(false)

  useEffect(() => {
    const paymentId = searchParams.get("payment_id")
    const status = searchParams.get("status")
    if (successChecked || !paymentId || status !== "succeeded") {
      setSuccessChecked(true)
      return
    }
    setSuccessChecked(true)
    fetch("/api/dodo/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof window !== "undefined") {
          window.localStorage.setItem("stellar_devkit_plan_order", data.paymentId)
          window.history.replaceState({}, "", "/pricing?success=1")
        }
      })
      .catch(() => {})
  }, [searchParams, successChecked])

  const openDodoCheckout = async (planId: string) => {
    setError(null)
    setLoading(planId)
    try {
      const res = await fetch("/api/dodo/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create checkout")
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setError("No checkout URL returned")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  const showSuccess = searchParams.get("success") === "1"

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />
      <PageTransition>
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white text-center mb-4">Pricing</h1>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            Choose the plan that fits your build. Upgrade anytime to unlock Pro templates and support.
          </p>
          {showSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
              Payment successful. Your plan is now active.
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 flex flex-col ${
                  plan.primary
                    ? "border-[#5100fd] bg-[#5100fd]/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.currency ?? ""}{plan.price}
                  </span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {plan.id === "free" ? (
                    <Link
                      href={plan.href}
                      className="inline-flex items-center justify-center w-full rounded-full px-6 py-3 text-sm font-medium border border-zinc-500 text-white bg-transparent hover:bg-zinc-800/80 hover:border-zinc-400 transition-all duration-300"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDodoCheckout(plan.id)}
                      disabled={!!loading}
                      className={`inline-flex items-center justify-center w-full rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.primary
                          ? "border border-[#5100fd] bg-[#5100fd]/50 text-white hover:bg-[#5100fd]/70 hover:border-[#5100fd]"
                          : "border border-zinc-500 text-white bg-transparent hover:bg-zinc-800/80 hover:border-zinc-400"
                      }`}
                    >
                      {loading === plan.id ? "Redirecting…" : plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-zinc-500">
            Payments powered by Dodo Payments. After payment we store your plan; use the same session or pass
            payment_id for API gating.
          </p>
        </div>
      </PageTransition>
    </main>
  )
}
