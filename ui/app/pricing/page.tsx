"use client"

import { useState } from "react"
import Script from "next/script"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import { Check } from "lucide-react"

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      order_id: string
      amount: number
      currency: string
      name: string
      description?: string
      handler: (res: { razorpay_payment_id: string; razorpay_order_id: string }) => void
      modal?: { ondismiss: () => void }
    }) => { open: () => void }
  }
}

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
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openRazorpay = async (planId: string) => {
    setError(null)
    setLoading(planId)
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create order")
        return
      }
      const { orderId, amount, currency, key } = data
      if (!window.Razorpay) {
        setError("Razorpay checkout not loaded")
        return
      }
      const rzp = new window.Razorpay({
        key,
        order_id: orderId,
        amount,
        currency,
        name: "Stellar DevKit",
        description: `${data.planId} plan`,
        handler: async (payment) => {
          const verifyRes = await fetch("/api/razorpay/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              planId: data.planId,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("stellar_devkit_plan_order", payment.razorpay_order_id)
            }
            setError(null)
            window.location.href = "/pricing?success=1"
          } else {
            setError(verifyData.error || "Verification failed")
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      })
      rzp.open()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <Navbar />
      <PageTransition>
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">Pricing</h1>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            Choose the plan that fits your build. Upgrade anytime to unlock Pro templates and support.
          </p>
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
                      onClick={() => openRazorpay(plan.id)}
                      disabled={!!loading}
                      className={`inline-flex items-center justify-center w-full rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.primary
                          ? "border border-[#5100fd] bg-[#5100fd]/50 text-white hover:bg-[#5100fd]/70 hover:border-[#5100fd]"
                          : "border border-zinc-500 text-white bg-transparent hover:bg-zinc-800/80 hover:border-zinc-400"
                      }`}
                    >
                      {loading === plan.id ? "Opening…" : plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-zinc-500">
            Access gating: Pro-only templates and advanced snippets check your plan. After payment we store your plan; use the same session or pass order_id for API gating.
          </p>
        </div>
      </PageTransition>
    </main>
  )
}
