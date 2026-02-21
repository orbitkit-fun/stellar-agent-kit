"use client";

import { useAccountContext } from "@/components/account-provider";

export type { AccountData } from "@/components/account-provider";

export function useAccount() {
  return useAccountContext();
}
