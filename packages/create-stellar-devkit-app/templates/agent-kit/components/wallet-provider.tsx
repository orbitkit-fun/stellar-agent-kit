"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { isConnected, isAllowed } from "@stellar/freighter-api";

interface WalletContextType {
  isFreighterAvailable: boolean;
  isAllowed: boolean;
  checkFreighterAvailability: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false);
  const [isWalletAllowed, setIsWalletAllowed] = useState(false);

  const checkFreighterAvailability = async () => {
    if (typeof window === "undefined") {
      setIsFreighterAvailable(false);
      setIsWalletAllowed(false);
      return;
    }
    try {
      const connected = await isConnected();
      setIsFreighterAvailable(!!connected);
      if (connected) {
        try {
          const allowed = await isAllowed();
          setIsWalletAllowed(allowed);
        } catch {
          setIsWalletAllowed(false);
        }
      } else {
        setIsWalletAllowed(false);
      }
    } catch {
      setIsFreighterAvailable(false);
      setIsWalletAllowed(false);
    }
  };

  useEffect(() => {
    checkFreighterAvailability();
    const t = setTimeout(checkFreighterAvailability, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isFreighterAvailable,
        isAllowed: isWalletAllowed,
        checkFreighterAvailability,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
