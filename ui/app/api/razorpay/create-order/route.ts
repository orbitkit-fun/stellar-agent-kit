import { NextResponse } from "next/server";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PLANS: Record<string, { amountPaise: number; name: string }> = {
  builder: { amountPaise: 49900, name: "Builder" }, // 499 INR
  pro: { amountPaise: 99900, name: "Pro" },          // 999 INR
};

export async function POST(req: Request) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
      { status: 500 }
    );
  }
  let body: { planId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const planId = (body.planId || "").toLowerCase();
  const plan = PLANS[planId];
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid planId. Use 'builder' or 'pro'." },
      { status: 400 }
    );
  }

  const orderPayload = {
    amount: plan.amountPaise,
    currency: "INR",
    receipt: `stellar-devkit-${planId}-${Date.now()}`,
    notes: { planId },
  };

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: "Razorpay order creation failed", details: err },
      { status: 502 }
    );
  }

  const order = (await res.json()) as { id: string; amount: number; currency: string };
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: RAZORPAY_KEY_ID,
    planId,
  });
}
