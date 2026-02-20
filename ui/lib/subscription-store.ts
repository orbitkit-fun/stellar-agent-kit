/**
 * Minimal subscription state for Razorpay plans.
 * In production replace with a database (e.g. by order_id or user_id).
 */

export type PlanId = "free" | "builder" | "pro";

const activePlansByOrderId = new Map<string, PlanId>();

export function setPlanForOrder(orderId: string, plan: PlanId): void {
  activePlansByOrderId.set(orderId, plan);
}

export function getPlanForOrder(orderId: string): PlanId | undefined {
  return activePlansByOrderId.get(orderId);
}

/** Use for access gating: pass order_id from client (e.g. stored in localStorage after checkout). */
export function getPlan(orderId: string | null | undefined): PlanId {
  if (!orderId) return "free";
  return activePlansByOrderId.get(orderId) ?? "free";
}
