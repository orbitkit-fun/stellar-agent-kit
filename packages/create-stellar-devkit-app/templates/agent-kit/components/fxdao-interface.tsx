"use client";

import { useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { Vote, ExternalLink, TrendingUp } from "lucide-react";
import { ConnectButton } from "./connect-button";
import { toast } from "sonner";

const SYNTHETIC_ASSETS = [
  { symbol: "USDx", name: "Synthetic USD", description: "USD-pegged synthetic stablecoin" },
  { symbol: "EURx", name: "Synthetic EUR", description: "EUR-pegged synthetic stablecoin" },
  { symbol: "GBPx", name: "Synthetic GBP", description: "GBP-pegged synthetic stablecoin" },
];

const FXDAO_ACTIONS = [
  { id: "mint", name: "Mint Stablecoins", description: "Lock XLM to mint synthetic stablecoins" },
  { id: "redeem", name: "Redeem Collateral", description: "Burn stablecoins to unlock XLM collateral" },
  { id: "stake", name: "Stake FXG", description: "Stake FXG tokens for governance rewards" },
  { id: "vault", name: "Manage Vault", description: "View and manage your collateral vault" },
];

export function FxdaoInterface() {
  const { account } = useAccount();
  const [selectedAction, setSelectedAction] = useState("mint");
  const [selectedAsset, setSelectedAsset] = useState("USDx");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFxdaoAction = async () => {
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
      const actionName = FXDAO_ACTIONS.find(a => a.id === selectedAction)?.name || selectedAction;
      toast.info(`${actionName} ${amount} ${selectedAsset} - Integration coming soon!`);
      
      // In a real implementation, this would interact with FxDAO contracts:
      // const FXDAO_VAULTS = "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB";
      // const contract = new Contract(FXDAO_VAULTS);
      
    } catch (error) {
      console.error("FxDAO error:", error);
      toast.error(`Failed to ${selectedAction}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Vote className="h-6 w-6 text-[#a78bfa]" />
        <h3 className="text-xl font-medium text-white">FxDAO</h3>
      </div>

      {!account?.address ? (
        <div className="text-center py-8">
          <p className="mb-4 text-zinc-400">Connect your wallet to access synthetic stablecoins</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Action</label>
            <div className="grid grid-cols-2 gap-2">
              {FXDAO_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedAction(action.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedAction === action.id
                      ? "border-[#5100fd] bg-[#5100fd]/10 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <div className="font-medium text-sm">{action.name}</div>
                  <div className="text-xs opacity-75">{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Asset Selection (for mint/redeem) */}
          {(selectedAction === "mint" || selectedAction === "redeem") && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Synthetic Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-[#5100fd] focus:outline-none"
              >
                {SYNTHETIC_ASSETS.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {selectedAction === "mint" ? "XLM to Lock" :
               selectedAction === "redeem" ? `${selectedAsset} to Burn` :
               selectedAction === "stake" ? "FXG to Stake" : "Amount"}
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
            onClick={handleFxdaoAction}
            disabled={loading || !amount}
            className="w-full rounded-xl bg-[#5100fd] py-3 font-medium text-white transition-colors hover:bg-[#6610ff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? `${FXDAO_ACTIONS.find(a => a.id === selectedAction)?.name}...` 
              : FXDAO_ACTIONS.find(a => a.id === selectedAction)?.name
            }
          </button>

          {/* Vault Status (placeholder) */}
          {selectedAction === "vault" && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[#a78bfa]" />
                <span className="font-medium text-white">Your Vault Status</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400">Collateral (XLM)</div>
                  <div className="text-white font-medium">-</div>
                </div>
                <div>
                  <div className="text-zinc-400">Debt (USDx)</div>
                  <div className="text-white font-medium">-</div>
                </div>
                <div>
                  <div className="text-zinc-400">Collateral Ratio</div>
                  <div className="text-white font-medium">-</div>
                </div>
                <div>
                  <div className="text-zinc-400">Liquidation Price</div>
                  <div className="text-white font-medium">-</div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-400 mb-2">
              {selectedAction === "mint" && "Lock XLM as collateral to mint synthetic stablecoins (USDx, EURx, GBPx)"}
              {selectedAction === "redeem" && "Burn synthetic stablecoins to unlock your XLM collateral"}
              {selectedAction === "stake" && "Stake FXG governance tokens to earn rewards and participate in protocol governance"}
              {selectedAction === "vault" && "Monitor your collateral position and manage risk parameters"}
            </p>
            <a
              href="https://fxdao.io/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#a78bfa] hover:underline"
            >
              FxDAO Documentation <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}