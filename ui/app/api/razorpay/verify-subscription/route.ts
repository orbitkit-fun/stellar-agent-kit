import { NextResponse } from "next/server";
import { setPlanForOrder, type PlanId } from "@/lib/subscription-store";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: Request) {
  if (!RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay not configured." },
      { status: 500 }
    );
  }
  let body: { orderId: string; paymentId?: string; planId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { orderId, paymentId, planId } = body;
  if (!orderId || !planId) {
    return NextResponse.json(
      { error: "orderId and planId required" },
      { status: 400 }
    );
  }
  const plan = (planId as string).toLowerCase() as PlanId;
  if (plan !== "builder" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
  }

  if (paymentId) {
    const verifyRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: "Basic " + Buffer.from(process.env.RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString("base64"),
      },
    });
    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
    const payment = (await verifyRes.json()) as { order_id?: string; status?: string };
    if (payment.order_id !== orderId || payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured for this order" },
        { status: 400 }
      );
    }
  }

  setPlanForOrder(orderId, plan);
  return NextResponse.json({ success: true, plan, orderId });
}
