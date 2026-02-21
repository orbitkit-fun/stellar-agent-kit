"use client"

import React, { useState } from "react"
import { useAccount } from "@/hooks/use-account"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { ConnectButton } from "./connect-button"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, ExternalLink, LogOut } from "lucide-react"
import { toast } from "sonner"

export function WalletData() {
  const mounted = useIsMounted()
  const { account, disconnect } = useAccount()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const copyAddress = async () => {
    if (account?.publicKey) {
      try {
        await navigator.clipboard.writeText(account.publicKey)
        toast.success("Address copied to clipboard!")
      } catch (error) {
        toast.error("Failed to copy address")
      }
      setDropdownOpen(false)
    }
  }

  const openInExplorer = () => {
    if (account?.publicKey) {
      window.open(`https://stellar.expert/explorer/public/account/${account.publicKey}`, "_blank")
    }
    setDropdownOpen(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setDropdownOpen(false)
  }

  if (!mounted) {
    return null
  }

  if (!account) {
    return (
      <ConnectButton
        label="Connect Wallet"
        variant="shiny"
        size="default"
        width={160}
        className="shrink-0"
      />
    )
  }

  const connectedLabel =
    account.displayName.length > 6
      ? `Connected • ${account.displayName}`
      : "Connected"

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="shrink-0 rounded-full border-zinc-600 text-white hover:bg-zinc-800 hover:border-zinc-500 min-w-[200px]"
        >
          {connectedLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-black/90 backdrop-blur-[120px] border-white/10 text-white"
        sideOffset={5}
        onPointerEnter={(e) => e.preventDefault()}
        onPointerLeave={(e) => e.preventDefault()}
      >
        <div 
          className="px-2 py-1.5 text-sm select-none pointer-events-none border-b border-white/5"
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <span 
            className="text-zinc-400" 
            style={{ 
              color: '#a1a1aa',
              transition: 'none'
            }}
            onMouseEnter={(e) => {
              e.stopPropagation()
              e.currentTarget.style.color = '#a1a1aa'
            }}
            onMouseLeave={(e) => {
              e.stopPropagation()
              e.currentTarget.style.color = '#a1a1aa'
            }}
          >
            Network: {account.network}
          </span>
        </div>
        <DropdownMenuItem 
          onClick={copyAddress} 
          className="gap-2 text-white cursor-pointer "
        >
          <Copy className="h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={openInExplorer} 
          className="gap-2 text-white cursor-pointer "
        >
          <ExternalLink className="h-4 w-4" />
          View in Explorer
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="gap-2 text-red-400 cursor-pointer "
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}