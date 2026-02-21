"use client";

import { useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { useWallet } from "@/components/wallet-provider";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

export function ConnectButton({ label = "Connect Wallet" }: { label?: string }) {
  const { connect, isLoading } = useAccount();
  const { isFreighterAvailable } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!isFreighterAvailable) {
      toast.error("Freighter wallet not found", {
        description: "Install the Freighter extension to continue.",
        action: {
          label: "Install",
          onClick: () => window.open("https://www.freighter.app/", "_blank"),
        },
      });
      return;
    }
    try {
      setIsConnecting(true);
      await connect();
      toast.success("Wallet connected");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to connect";
      if (msg.toLowerCase().includes("declined")) {
        toast.error("Connection cancelled");
      } else {
        toast.error("Failed to connect", { description: msg });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isLoading || isConnecting}
      className="inline-flex items-center gap-2 rounded-full border border-[#5100fd] bg-[#5100fd]/50 px-5 py-2.5 text-white font-medium hover:bg-[#5100fd]/70 disabled:opacity-50"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : label}
    </button>
  );
}
