"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isConnected, isAllowed, getAddress, getNetwork, requestAccess } from "@stellar/freighter-api";

export interface AccountData {
  publicKey: string;
  displayName: string;
  network: string;
}

interface AccountContextType {
  account: AccountData | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

function formatDisplayName(address: string): string {
  if (typeof address !== "string" || address.length < 8) return address || "Unknown";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

async function checkConnection(): Promise<AccountData | null> {
  if (typeof window === "undefined") return null;
  try {
    const connected = await isConnected();
    if (!connected) return null;
    const allowed = await isAllowed();
    if (!allowed) return null;
    const addressResult = await getAddress() as { address?: string; publicKey?: string; error?: string };
    const raw = addressResult.error ? null : (addressResult.address ?? addressResult.publicKey);
    const address = raw && String(raw).trim() ? String(raw).trim() : null;
    if (!address || address.length < 8) return null;
    const networkResult = await getNetwork();
    const networkName =
      typeof networkResult === "object" && networkResult && (networkResult as { network?: string }).network
        ? (networkResult as { network: string }).network
        : typeof networkResult === "string" ? networkResult : "Unknown";
    return {
      publicKey: address,
      displayName: formatDisplayName(address),
      network: networkName,
    };
  } catch {
    return null;
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
    try {
      const next = await checkConnection();
      setAccount(next);
    } catch {
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    checkConnection()
      .then((next) => { if (!cancelled) setAccount(next); })
      .catch(() => { if (!cancelled) setAccount(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const accessResult = await requestAccess();
      if (accessResult.error) throw new Error(accessResult.error);
      const rawAddress = (accessResult as { address?: string; publicKey?: string }).address
        ?? (accessResult as { address?: string; publicKey?: string }).publicKey;
      const address = rawAddress && typeof rawAddress === "string" ? rawAddress.trim() : null;
      if (!address || address.length < 8) {
        throw new Error("No address returned from wallet. Please try again or unlock Freighter.");
      }
      const networkResult = await getNetwork();
      const networkName =
        typeof networkResult === "object" && networkResult && (networkResult as { network?: string }).network
          ? (networkResult as { network: string }).network
          : typeof networkResult === "string" ? networkResult : "Unknown";
      setAccount({
        publicKey: address,
        displayName: formatDisplayName(address),
        network: networkName,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => setAccount(null), []);

  return (
    <AccountContext.Provider
      value={{
        account,
        isLoading,
        connect,
        disconnect,
        refreshAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccountContext() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
