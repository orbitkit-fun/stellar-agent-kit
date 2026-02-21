"use client";

import React, { useState, useEffect } from "react";
import { signTransaction } from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";
import { useAccount } from "@/hooks/use-account";
import { useSoroSwap } from "@/hooks/use-soroswap";
import { ConnectButton } from "@/components/connect-button";
import { toast } from "sonner";
import { ArrowDownUp } from "lucide-react";

const ASSETS = {
  XLM: {
    symbol: "XLM",
    name: "Stellar Lumens",
    contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
    decimals: 7,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    decimals: 7,
  },
} as const;

type Asset = (typeof ASSETS)[keyof typeof ASSETS];

export function SwapInterface() {
  const { account } = useAccount();
  const { getQuote, buildSwap, submitSwap, isLoading: soroLoading } = useSoroSwap();
  const [fromAsset, setFromAsset] = useState<Asset>(ASSETS.XLM);
  const [toAsset, setToAsset] = useState<Asset>(ASSETS.USDC);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);

  const handleSwapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount(toAmount);
    setToAmount("");
    setQuote(null);
  };

  useEffect(() => {
    if (!fromAmount || !account || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setQuote(null);
      return;
    }
    const rawAmount = Math.round(
      parseFloat(fromAmount) * Math.pow(10, fromAsset.decimals)
    ).toString();
    setQuoteLoading(true);
    getQuote(
      { contractId: fromAsset.contractId },
      { contractId: toAsset.contractId },
      rawAmount
    )
      .then((q) => {
        const outDisplay = (
          parseFloat(q.expectedOut) / Math.pow(10, toAsset.decimals)
        ).toFixed(6);
        setToAmount(outDisplay);
        setQuote({ ...q, expectedOut: outDisplay });
      })
      .catch((err) => {
        toast.error("Quote failed", {
          description: err instanceof Error ? err.message : "Try again",
        });
        setToAmount("");
        setQuote(null);
      })
      .finally(() => setQuoteLoading(false));
  }, [fromAmount, fromAsset, toAsset, account]);

  const handleSwap = async () => {
    if (!account || !quote || !fromAmount) return;
    try {
      setQuoteLoading(true);
      const network = "mainnet";
      const { xdr } = await buildSwap(quote as Parameters<typeof buildSwap>[0], account.publicKey, network);
      const signResult = await signTransaction(xdr, { networkPassphrase: Networks.PUBLIC });
      if (signResult.error) {
        if (signResult.error.message?.toLowerCase().includes("rejected")) {
          toast.info("Swap cancelled");
        } else {
          toast.error("Signing failed", { description: signResult.error.message });
        }
        return;
      }
      if (!signResult.signedTxXdr) {
        toast.error("No signed transaction returned");
        return;
      }
      const result = await submitSwap(signResult.signedTxXdr, network);
      toast.success("Swap successful!", { description: `Tx: ${result.hash.slice(0, 8)}...` });
      setFromAmount("");
      setToAmount("");
      setQuote(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Swap failed";
      toast.error(msg.includes("SOROSWAP_API_KEY") ? "Set SOROSWAP_API_KEY in .env" : "Swap failed", {
        description: msg,
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-center">
        <h3 className="mb-4 text-xl font-medium text-white">Connect Wallet</h3>
        <p className="mb-6 text-zinc-400">Connect your wallet to swap tokens on Stellar.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-400">
        <span>From</span>
      </div>
      <div className="mb-2 flex items-center justify-between rounded-xl border border-zinc-800 bg-black/50 p-4">
        <input
          type="number"
          placeholder="0.0"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          className="w-full min-w-0 flex-1 bg-transparent text-xl text-white placeholder:text-zinc-500 focus:outline-none"
        />
        <select
          value={fromAsset.symbol}
          onChange={(e) => setFromAsset(ASSETS[e.target.value as keyof typeof ASSETS])}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        >
          {Object.values(ASSETS).map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={handleSwapAssets}
          className="rounded-full border border-zinc-700 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Swap assets"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-zinc-400">
        <span>To</span>
      </div>
      <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-black/50 p-4">
        <input
          type="text"
          placeholder="0.0"
          value={toAmount}
          readOnly
          className="w-full min-w-0 flex-1 bg-transparent text-xl text-white placeholder:text-zinc-500 focus:outline-none"
        />
        <select
          value={toAsset.symbol}
          onChange={(e) => setToAsset(ASSETS[e.target.value as keyof typeof ASSETS])}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        >
          {Object.values(ASSETS).map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.symbol}
            </option>
          ))}
        </select>
      </div>

      {quote && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Minimum received</span>
            <span className="text-white">
              {String((quote as { minOut?: string }).minOut ?? "")} {toAsset.symbol}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSwap}
        disabled={
          !fromAmount ||
          !toAmount ||
          quoteLoading ||
          soroLoading ||
          parseFloat(fromAmount) <= 0
        }
        className="w-full rounded-xl bg-[#5100fd] py-3.5 font-medium text-white hover:bg-[#6610ff] disabled:opacity-50"
      >
        {quoteLoading || soroLoading ? "Getting quote..." : "Swap"}
      </button>
      <p className="mt-4 text-center text-xs text-zinc-500">
        Powered by SoroSwap · Routes: SoroSwap, Phoenix, Aqua
      </p>
    </div>
  );
}
