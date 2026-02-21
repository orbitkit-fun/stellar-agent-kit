"use client";

import { useEffect, useState } from "react";

const SYMBOLS = ["XLM", "USDC", "BTC"] as const;
type PriceData = { price: string; timestamp: number; decimals: number };

export function PricesInterface() {
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      SYMBOLS.map(async (symbol) => {
        const res = await fetch(`/api/price?symbol=${symbol}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Failed to get ${symbol} price`);
        }
        return res.json() as Promise<PriceData>;
      })
    )
      .then((results) => {
        if (cancelled) return;
        const next: Record<string, PriceData | null> = {};
        SYMBOLS.forEach((s, i) => {
          next[s] = results[i] ?? null;
        });
        setPrices(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load prices");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
        <p className="text-zinc-400">Loading prices from Reflector oracle…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
        <p className="text-red-400">{error}</p>
        <p className="mt-2 text-sm text-zinc-500">Reflector (SEP-40) oracle on Stellar mainnet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
      <h3 className="mb-1 text-lg font-medium text-white">Live prices (Reflector oracle)</h3>
      <p className="mb-6 text-sm text-zinc-500">SEP-40 price feeds on Stellar mainnet.</p>
      <ul className="space-y-4">
        {SYMBOLS.map((symbol) => {
          const data = prices[symbol];
          if (!data) return null;
          const normalized = Number(data.price) / 10 ** data.decimals;
          return (
            <li
              key={symbol}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/50 px-4 py-3"
            >
              <span className="font-medium text-white">{symbol}</span>
              <span className="tabular-nums text-zinc-300">
                {normalized.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
