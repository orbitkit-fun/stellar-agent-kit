"use client";

import Link from "next/link";
import { useAccount } from "@/hooks/use-account";
import { ConnectButton } from "@/components/connect-button";

export function Navbar() {
  const { account, disconnect } = useAccount();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white hover:text-zinc-200">
          Stellar App
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            Swap
          </Link>
          {account ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">{account.displayName}</span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </nav>
  );
}
