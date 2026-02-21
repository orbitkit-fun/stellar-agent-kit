"use client";

import React, { useState } from "react";
import { signTransaction } from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";
import { useAccount } from "@/hooks/use-account";
import { ConnectButton } from "@/components/connect-button";
import { toast } from "sonner";

const ASSETS = [
  { symbol: "XLM", name: "Stellar Lumens" },
  { symbol: "USDC", name: "USD Coin" },
] as const;
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export function SendInterface() {
  const { account } = useAccount();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<{ symbol: string; name: string }>(ASSETS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!account || !toAddress.trim() || !amount || parseFloat(amount) <= 0) return;
    try {
      setIsLoading(true);
      const buildRes = await fetch("/api/send/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress: account.publicKey,
          to: toAddress.trim(),
          amount: amount.trim(),
          assetCode: asset.symbol === "XLM" ? undefined : asset.symbol,
          assetIssuer: asset.symbol === "USDC" ? USDC_ISSUER : undefined,
        }),
      });
      if (!buildRes.ok) {
        const data = await buildRes.json().catch(() => ({}));
        throw new Error(data?.error || `Build failed ${buildRes.status}`);
      }
      const { xdr } = await buildRes.json();
      const signResult = await signTransaction(xdr, { networkPassphrase: Networks.PUBLIC });
      if (signResult.error) {
        if (signResult.error.message?.toLowerCase().includes("rejected")) {
          toast.info("Send cancelled");
        } else {
          toast.error("Signing failed", { description: signResult.error.message });
        }
        return;
      }
      if (!signResult.signedTxXdr) {
        toast.error("No signed transaction returned");
        return;
      }
      const submitRes = await fetch("/api/send/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr: signResult.signedTxXdr }),
      });
      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data?.error || "Submit failed");
      }
      const { hash } = await submitRes.json();
      toast.success("Payment sent!", { description: `Tx: ${hash.slice(0, 8)}...` });
      setToAddress("");
      setAmount("");
    } catch (error) {
      toast.error("Send failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-center">
        <h3 className="mb-4 text-xl font-medium text-white">Connect Wallet</h3>
        <p className="mb-6 text-zinc-400">Connect your wallet to send XLM or USDC.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
      <div className="mb-4">
        <label className="mb-2 block text-sm text-zinc-400">Recipient (G...)</label>
        <input
          type="text"
          placeholder="G..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-[#5100fd] focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="mb-2 block text-sm text-zinc-400">Amount</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-[#5100fd] focus:outline-none"
          />
          <select
            value={asset.symbol}
            onChange={(e) => setAsset(ASSETS.find((a) => a.symbol === e.target.value) ?? ASSETS[0])}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
          >
            {ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!toAddress.trim() || !amount || isLoading || parseFloat(amount) <= 0}
        className="w-full rounded-xl bg-[#5100fd] py-3.5 font-medium text-white hover:bg-[#6610ff] disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
