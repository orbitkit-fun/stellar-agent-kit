"use client";

import { useState } from "react";

interface Asset {
  contractId?: string;
  code?: string;
  issuer?: string;
}

interface QuoteResponse {
  expectedIn: string;
  expectedOut: string;
  minOut: string;
  route: string[];
  rawData?: unknown;
}

export function useSoroSwap() {
  const [isLoading, setIsLoading] = useState(false);

  const getQuote = async (
    fromAsset: Asset,
    toAsset: Asset,
    amount: string,
    _network: "testnet" | "mainnet" = "mainnet"
  ): Promise<QuoteResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromAsset, toAsset, amount }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to get quote");
      }
      return res.json();
    } finally {
      setIsLoading(false);
    }
  };

  const buildSwap = async (
    quote: QuoteResponse,
    fromAddress: string,
    _network: "testnet" | "mainnet" = "mainnet"
  ): Promise<{ xdr: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swap/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, fromAddress }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to build swap");
      }
      return res.json();
    } finally {
      setIsLoading(false);
    }
  };

  const submitSwap = async (
    signedXdr: string,
    _network: "testnet" | "mainnet" = "mainnet"
  ): Promise<{ hash: string; status: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swap/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit swap");
      }
      return res.json();
    } finally {
      setIsLoading(false);
    }
  };

  return { getQuote, buildSwap, submitSwap, isLoading };
}
