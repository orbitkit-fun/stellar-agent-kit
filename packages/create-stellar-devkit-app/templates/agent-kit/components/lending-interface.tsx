"use client";

import { useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { Landmark, ExternalLink } from "lucide-react";
import { ConnectButton } from "./connect-button";
import { toast } from "sonner";

export function LendingInterface() {
  const { account } = useAccount();
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("USDC");
  const [action, setAction] = useState<"supply" | "borrow">("supply");
  const [loading, setLoading] = useState(false);

  const handleLending = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // This would integrate with Blend protocol
      // For now, show info about the integration
      toast.info(`${action === "supply" ? "Supply" : "Borrow"} ${amount} ${asset} - Integration coming soon!`);
      
      // In a real implementation, this would call:
      // await agent.lendingSupply() or await agent.lendingBorrow()
      
    } catch (error) {
      console.error("Lending error:", error);
      toast.error(`Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Landmark className="h-6 w-6 text-[#a78bfa]" />
        <h3 className="text-xl font-medium text-white">Blend Lending</h3>
      </div>

      {!account?.address ? (
        <div className="text-center py-8">
          <p className="mb-4 text-zinc-400">Connect your wallet to supply or borrow assets</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Toggle */}
          <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setAction("supply")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                action === "supply"
                  ? "bg-[#5100fd] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Supply
            </button>
            <button
              type="button"
              onClick={() => setAction("borrow")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                action === "borrow"
                  ? "bg-[#5100fd] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Borrow
            </button>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-[#5100fd] focus:outline-none"
            >
              <option value="USDC">USDC</option>
              <option value="XLM">XLM</option>
              <option value="EURC">EURC</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Amount to {action}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-[#5100fd] focus:outline-none"
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleLending}
            disabled={loading || !amount}
            className="w-full rounded-xl bg-[#5100fd] py-3 font-medium text-white transition-colors hover:bg-[#6610ff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? `${action === "supply" ? "Supplying" : "Borrowing"}...` : 
             action === "supply" ? `Supply ${asset}` : `Borrow ${asset}`}
          </button>

          {/* Info */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-400 mb-2">
              {action === "supply" 
                ? "Supply assets to earn interest on Blend protocol"
                : "Borrow assets against your collateral on Blend protocol"
              }
            </p>
            <a
              href="https://blend.capital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#a78bfa] hover:underline"
            >
              Learn more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}