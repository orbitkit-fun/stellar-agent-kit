"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, TrendingDown, ArrowUpFromLine, RotateCcw, Info, CheckCircle, XCircle } from "lucide-react"
import { useAccount } from "@/hooks/use-account"
import { useBalance } from "@/hooks/use-balance"
import { useNetworkProfile } from "@/contexts/network-profile-context"
import { NetworkMismatchDialog } from "./network-mismatch-dialog"
import { isNetworkMismatch } from "@/lib/network-validation"
import { demoApiHeaders } from "@/lib/get-devkit-app-id"
import { MAINNET_ASSETS } from "stellar-agent-kit"
import { normalizeNetwork } from "@/lib/network"
import { toast } from "sonner"

// Use official mainnet contract IDs from stellar-agent-kit (valid StrKey format for Blend SDK)
const BLEND_ASSETS = [
  { symbol: "USDC", name: "USD Coin", contractId: MAINNET_ASSETS.USDC.contractId },
  { symbol: "XLM", name: "Stellar Lumens", contractId: MAINNET_ASSETS.XLM.contractId },
] as const

// Mainnet Blend pools (from blend-utils mainnet.contracts.json). Default = first non-frozen.
const BLEND_POOLS = [
  { id: "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD", name: "Fixed Pool V2", frozen: false },
  { id: "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS", name: "Fixed XLM-USDC Pool V1", frozen: true },
] as const
const DEFAULT_POOL_ID = BLEND_POOLS[0].id

type BlendAsset = typeof BLEND_ASSETS[number]

interface BlendTransaction {
  id: string
  type: "supply" | "borrow" | "withdraw" | "repay"
  asset: string
  amount: string
  status: "pending" | "success" | "error"
  hash?: string
  timestamp: number
}

interface SupplyBorrowState {
  asset: BlendAsset | null
  amount: string
  isLoading: boolean
  error: string | null
}

// Helper function to parse Blend error messages
function parseBlendError(errorMessage: string, operation: 'supply' | 'borrow' | 'withdraw' | 'repay' = 'supply'): string {
  if (errorMessage.includes("#1206")) {
    if (operation === 'supply') {
      return "Invalid pool status. The Blend pool may be frozen or in a restricted state—supply is not allowed right now. Check pool status at blend.capital or try again later."
    } else {
      return "Cannot borrow without collateral. Please supply assets first in the Supply tab, then try borrowing again."
    }
  }
  if (errorMessage.includes("#1205")) {
    return "Health factor would be too low. Supply more collateral or borrow a smaller amount."
  }
  if (errorMessage.includes("#1224")) {
    return "Minimum collateral requirement not met. Supply more assets as collateral."
  }
  if (errorMessage.includes("#1223")) {
    if (operation === 'supply') {
      return "This asset is currently disabled for deposits. Try a different asset."
    } else {
      return "This asset is currently disabled for borrowing. Try a different asset."
    }
  }
  if (errorMessage.includes("#1003")) {
    return "Insufficient funds in the lending pool. Try borrowing a smaller amount or try later."
  }
  if (errorMessage.includes("#1216")) {
    if (operation === 'supply') {
      return "Invalid supply amount. Check the amount and try again."
    } else {
      return "Invalid borrow amount. Check the amount and try again."
    }
  }
  return errorMessage
}

export function BlendInterface() {
  const { account, publicKey, isConnected, signTransaction, disconnect } = useAccount()
  const { network: profileNetwork, setNetwork } = useNetworkProfile()
  const [supplyState, setSupplyState] = useState<SupplyBorrowState>({
    asset: BLEND_ASSETS[0],
    amount: "",
    isLoading: false,
    error: null,
  })
  const [borrowState, setBorrowState] = useState<SupplyBorrowState>({
    asset: BLEND_ASSETS[0],
    amount: "",
    isLoading: false,
    error: null,
  })
  const [withdrawState, setWithdrawState] = useState<SupplyBorrowState>({
    asset: BLEND_ASSETS[0],
    amount: "",
    isLoading: false,
    error: null,
  })
  const [repayState, setRepayState] = useState<SupplyBorrowState>({
    asset: BLEND_ASSETS[0],
    amount: "",
    isLoading: false,
    error: null,
  })
  const [transactions, setTransactions] = useState<BlendTransaction[]>([])
  const [poolId, setPoolId] = useState<string>(DEFAULT_POOL_ID)
  const [showNetworkMismatch, setShowNetworkMismatch] = useState(false)

  // Check for network mismatch
  const hasNetworkMismatch = account && isNetworkMismatch(account.network, profileNetwork)
  const { getBalance, isLoading: balanceLoading, error: balanceError } = useBalance()

  const selectedPool = BLEND_POOLS.find(p => p.id === poolId) ?? BLEND_POOLS[0]
  const isPoolFrozen = selectedPool.frozen

  const handleSupply = async () => {
    if (!isConnected || !publicKey || !supplyState.asset || !supplyState.amount) {
      setSupplyState(prev => ({ ...prev, error: "Please connect wallet and fill all fields" }))
      return
    }

    // Check for network mismatch before proceeding
    if (hasNetworkMismatch) {
      setShowNetworkMismatch(true)
      return
    }

    setSupplyState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Build supply transaction
      const response = await fetch("/api/lending/supply", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({
          publicKey,
          asset: supplyState.asset.contractId,
          amount: supplyState.amount,
          network: account ? normalizeNetwork(account.network) : "mainnet",
          poolId,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to build supply transaction")
      }

      const { xdr } = await response.json()

      // Sign transaction with Freighter (always use mainnet for Blend)
      const networkPassphrase = "Public Global Stellar Network ; September 2015"
      const signedXdr = await signTransaction(xdr, { networkPassphrase })

      // Submit signed transaction
      const network = account ? normalizeNetwork(account.network) : "mainnet"
      const submitResponse = await fetch("/api/lending/submit", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({ 
          signedXdr,
          network 
        }),
      })

      if (!submitResponse.ok) {
        const body = await submitResponse.text()
        let message = "Failed to submit transaction"
        try {
          const parsed = JSON.parse(body)
          if (typeof parsed?.error === "string") message = parsed.error
        } catch {
          if (body) message = body
        }
        throw new Error(message)
      }

      const { hash } = await submitResponse.json()

      // Add to transaction history
      const newTransaction: BlendTransaction = {
        id: Date.now().toString(),
        type: "supply",
        asset: supplyState.asset.symbol,
        amount: supplyState.amount,
        status: "success",
        hash,
        timestamp: Date.now(),
      }
      setTransactions(prev => [newTransaction, ...prev])

      // Reset form
      setSupplyState(prev => ({ ...prev, amount: "", isLoading: false }))
    } catch (error) {
      console.error("Supply error:", error)
      const errorMessage = error instanceof Error ? error.message : "Supply failed"
      setSupplyState(prev => ({
        ...prev,
        error: parseBlendError(errorMessage, 'supply'),
        isLoading: false,
      }))
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected || !publicKey || !withdrawState.asset || !withdrawState.amount) {
      setWithdrawState(prev => ({ ...prev, error: "Please connect wallet and fill all fields" }))
      return
    }
    if (hasNetworkMismatch) {
      setShowNetworkMismatch(true)
      return
    }
    setWithdrawState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await fetch("/api/lending/withdraw", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({
          publicKey,
          asset: withdrawState.asset!.contractId,
          amount: withdrawState.amount,
          network: account ? normalizeNetwork(account.network) : "mainnet",
          poolId,
        }),
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to build withdraw transaction")
      }
      const { xdr } = await response.json()
      const networkPassphrase = "Public Global Stellar Network ; September 2015"
      const signedXdr = await signTransaction(xdr, { networkPassphrase })
      const network = account ? normalizeNetwork(account.network) : "mainnet"
      const submitResponse = await fetch("/api/lending/submit", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({ signedXdr, network }),
      })
      if (!submitResponse.ok) {
        const body = await submitResponse.text()
        let message = "Failed to submit transaction"
        try {
          const parsed = JSON.parse(body)
          if (typeof parsed?.error === "string") message = parsed.error
        } catch {
          if (body) message = body
        }
        throw new Error(message)
      }
      const { hash } = await submitResponse.json()
      setTransactions(prev => [{
        id: Date.now().toString(),
        type: "withdraw",
        asset: withdrawState.asset!.symbol,
        amount: withdrawState.amount,
        status: "success",
        hash,
        timestamp: Date.now(),
      }, ...prev])
      setWithdrawState(prev => ({ ...prev, amount: "", isLoading: false }))
    } catch (error) {
      console.error("Withdraw error:", error)
      const errorMessage = error instanceof Error ? error.message : "Withdraw failed"
      setWithdrawState(prev => ({
        ...prev,
        error: parseBlendError(errorMessage, 'withdraw'),
        isLoading: false,
      }))
    }
  }

  const handleRepay = async () => {
    if (!isConnected || !publicKey || !repayState.asset || !repayState.amount) {
      setRepayState(prev => ({ ...prev, error: "Please connect wallet and fill all fields" }))
      return
    }
    if (hasNetworkMismatch) {
      setShowNetworkMismatch(true)
      return
    }
    setRepayState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await fetch("/api/lending/repay", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({
          publicKey,
          asset: repayState.asset!.contractId,
          amount: repayState.amount,
          network: account ? normalizeNetwork(account.network) : "mainnet",
          poolId,
        }),
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to build repay transaction")
      }
      const { xdr } = await response.json()
      const networkPassphrase = "Public Global Stellar Network ; September 2015"
      const signedXdr = await signTransaction(xdr, { networkPassphrase })
      const network = account ? normalizeNetwork(account.network) : "mainnet"
      const submitResponse = await fetch("/api/lending/submit", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({ signedXdr, network }),
      })
      if (!submitResponse.ok) {
        const body = await submitResponse.text()
        let message = "Failed to submit transaction"
        try {
          const parsed = JSON.parse(body)
          if (typeof parsed?.error === "string") message = parsed.error
        } catch {
          if (body) message = body
        }
        throw new Error(message)
      }
      const { hash } = await submitResponse.json()
      setTransactions(prev => [{
        id: Date.now().toString(),
        type: "repay",
        asset: repayState.asset!.symbol,
        amount: repayState.amount,
        status: "success",
        hash,
        timestamp: Date.now(),
      }, ...prev])
      setRepayState(prev => ({ ...prev, amount: "", isLoading: false }))
    } catch (error) {
      console.error("Repay error:", error)
      const errorMessage = error instanceof Error ? error.message : "Repay failed"
      setRepayState(prev => ({
        ...prev,
        error: parseBlendError(errorMessage, 'repay'),
        isLoading: false,
      }))
    }
  }

  const handleBorrow = async () => {
    if (!isConnected || !publicKey || !borrowState.asset || !borrowState.amount) {
      setBorrowState(prev => ({ ...prev, error: "Please connect wallet and fill all fields" }))
      return
    }

    // Check for network mismatch before proceeding
    if (hasNetworkMismatch) {
      setShowNetworkMismatch(true)
      return
    }

    // Check if user has supplied any assets first
    const hasSuppliedAssets = transactions.some(tx => tx.type === "supply" && tx.status === "success")
    if (!hasSuppliedAssets) {
      setBorrowState(prev => ({ 
        ...prev, 
        error: "You must supply collateral before borrowing. Switch to the Supply tab first." 
      }))
      return
    }

    setBorrowState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Build borrow transaction
      const response = await fetch("/api/lending/borrow", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({
          publicKey,
          asset: borrowState.asset.contractId,
          amount: borrowState.amount,
          network: account ? normalizeNetwork(account.network) : "mainnet",
          poolId,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to build borrow transaction")
      }

      const { xdr } = await response.json()

      // Sign transaction with Freighter (always use mainnet for Blend)
      const networkPassphrase = "Public Global Stellar Network ; September 2015"
      const signedXdr = await signTransaction(xdr, { networkPassphrase })

      // Submit signed transaction
      const network = account ? normalizeNetwork(account.network) : "mainnet"
      const submitResponse = await fetch("/api/lending/submit", {
        method: "POST",
        headers: demoApiHeaders(),
        body: JSON.stringify({ 
          signedXdr,
          network 
        }),
      })

      if (!submitResponse.ok) {
        const body = await submitResponse.text()
        let message = "Failed to submit transaction"
        try {
          const parsed = JSON.parse(body)
          if (typeof parsed?.error === "string") message = parsed.error
        } catch {
          if (body) message = body
        }
        throw new Error(message)
      }

      const { hash } = await submitResponse.json()

      // Add to transaction history
      const newTransaction: BlendTransaction = {
        id: Date.now().toString(),
        type: "borrow",
        asset: borrowState.asset.symbol,
        amount: borrowState.amount,
        status: "success",
        hash,
        timestamp: Date.now(),
      }
      setTransactions(prev => [newTransaction, ...prev])

      // Reset form
      setBorrowState(prev => ({ ...prev, amount: "", isLoading: false }))
    } catch (error) {
      console.error("Borrow error:", error)
      const errorMessage = error instanceof Error ? error.message : "Borrow failed"
      setBorrowState(prev => ({
        ...prev,
        error: parseBlendError(errorMessage, 'borrow'),
        isLoading: false,
      }))
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Connect your Freighter wallet to interact with Blend Protocol
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show account funding error if present
  if (balanceError && balanceError.includes("Account not found")) {
    const isMainnet = account?.network?.toLowerCase() !== "testnet"
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Account Not Funded</p>
              <p className="text-sm">
                Your account ({account?.publicKey?.slice(0, 8)}...{account?.publicKey?.slice(-8)}) 
                is not funded on {isMainnet ? "mainnet" : "testnet"}.
              </p>
              {isMainnet ? (
                <div className="text-sm space-y-1">
                  <p>To use Blend Protocol on mainnet, you need to:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Fund your account with XLM</li>
                    <li>Or switch to testnet in Freighter wallet</li>
                  </ul>
                </div>
              ) : (
                <div className="text-sm space-y-1">
                  <p><strong>Note:</strong> Blend Protocol is only available on mainnet.</p>
                  <p>Fund your testnet account at:</p>
                  <a 
                    href="https://laboratory.stellar.org/#account-creator?network=test" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Stellar Laboratory
                  </a>
                  <p>Then switch to mainnet in Freighter to use Blend.</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show warning if on testnet
  const isTestnet = account?.network?.toLowerCase() === "testnet"
  if (isTestnet) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Testnet Not Supported</p>
              <p className="text-sm">
                Blend Protocol is only available on mainnet. Please switch to mainnet in your Freighter wallet to use Blend.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const hasSuppliedAssets = transactions.some(tx => tx.type === "supply" && tx.status === "success")
  const suppliedAssets = transactions.filter(tx => tx.type === "supply" && tx.status === "success")

  return (
    <div className="space-y-6">
      {/* Pool selector */}
      <div className="space-y-2">
        <Label className="text-zinc-400">Pool</Label>
        <Select value={poolId} onValueChange={setPoolId}>
          <SelectTrigger className="w-full max-w-sm bg-zinc-800 border-zinc-600 text-white">
            <SelectValue placeholder="Select pool" />
          </SelectTrigger>
          <SelectContent>
            {BLEND_POOLS.map((pool) => (
              <SelectItem key={pool.id} value={pool.id} className="text-white">
                {pool.name} {pool.frozen ? "(Frozen)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frozen pool warning */}
      {isPoolFrozen && (
        <Alert variant="destructive" className="border-red-800 bg-red-950/30">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>This pool is frozen.</strong> Supplying and borrowing are suspended. You can withdraw and repay on{" "}
            <a href="https://mainnet.blend.capital" target="_blank" rel="noopener noreferrer" className="underline">blend.capital</a>.
            Switch to <strong>Fixed Pool V2</strong> above to supply and borrow here.
          </AlertDescription>
        </Alert>
      )}

      {/* Collateral Status */}
      {hasSuppliedAssets && (
        <Alert className="bg-green-900/20 border-green-700">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription>
            <strong>Collateral Supplied:</strong> You have supplied {suppliedAssets.length} asset(s) as collateral. 
            You can now borrow against your collateral.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="supply" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-zinc-900 border border-zinc-700">
          <TabsTrigger
            value="supply"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Supply
          </TabsTrigger>
          <TabsTrigger
            value="borrow"
            className={`data-[state=active]:bg-zinc-700 data-[state=active]:text-white ${
              !hasSuppliedAssets ? "opacity-60" : ""
            }`}
            title={!hasSuppliedAssets ? "Supply collateral first to enable borrowing" : ""}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Borrow
          </TabsTrigger>
          <TabsTrigger
            value="withdraw"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger
            value="repay"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Repay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="space-y-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 1:</strong> Supply assets as collateral to earn interest.{" "}
              <strong>Step 2:</strong> Once supplied, you can borrow against your collateral.
              {" "}Supply and borrow depend on pool status; if you see an invalid pool status error, check{" "}
              <a href="https://blend.capital" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">blend.capital</a> for current status.
            </AlertDescription>
          </Alert>
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Supply Assets</CardTitle>
              <CardDescription>
                Deposit assets to earn interest and use as collateral for borrowing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supply-asset" className="text-white">Asset</Label>
                <Select
                  value={supplyState.asset?.symbol || ""}
                  onValueChange={(value) => {
                    const asset = BLEND_ASSETS.find(a => a.symbol === value)
                    setSupplyState(prev => ({ ...prev, asset: asset || null, error: null }))
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {BLEND_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="text-white hover:bg-zinc-700">
                        <div className="flex items-center gap-2">
                          <span>{asset.symbol}</span>
                          <span className="text-zinc-400">({asset.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supply-amount" className="text-white">Amount</Label>
                <div className="relative">
                  <Input
                    id="supply-amount"
                    type="number"
                    placeholder="0.00"
                    value={supplyState.amount}
                    onChange={(e) => setSupplyState(prev => ({ ...prev, amount: e.target.value, error: null }))}
                    className="bg-zinc-800 border-zinc-600 text-white pr-16"
                  />
                  {supplyState.asset && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      {supplyState.asset.symbol}
                    </div>
                  )}
                </div>
                {supplyState.asset && (
                  <p className="text-xs text-zinc-400">
                    Balance: {balanceLoading ? "..." : getBalance(supplyState.asset.symbol)} {supplyState.asset.symbol}
                  </p>
                )}
              </div>

              {supplyState.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{supplyState.error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSupply}
                disabled={supplyState.isLoading || !supplyState.asset || !supplyState.amount || isPoolFrozen}
                className="w-full bg-[#a78bfa] hover:bg-[#9333ea] text-white"
              >
                {supplyState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Supplying...
                  </>
                ) : (
                  "Supply Asset"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You must supply collateral first before you can borrow. 
              Switch to the "Supply" tab to deposit assets as collateral.
            </AlertDescription>
          </Alert>
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Borrow Assets</CardTitle>
              <CardDescription>
                Borrow assets against your supplied collateral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borrow-asset" className="text-white">Asset</Label>
                <Select
                  value={borrowState.asset?.symbol || ""}
                  onValueChange={(value) => {
                    const asset = BLEND_ASSETS.find(a => a.symbol === value)
                    setBorrowState(prev => ({ ...prev, asset: asset || null, error: null }))
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {BLEND_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="text-white hover:bg-zinc-700">
                        <div className="flex items-center gap-2">
                          <span>{asset.symbol}</span>
                          <span className="text-zinc-400">({asset.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borrow-amount" className="text-white">Amount</Label>
                <div className="relative">
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="0.00"
                    value={borrowState.amount}
                    onChange={(e) => setBorrowState(prev => ({ ...prev, amount: e.target.value, error: null }))}
                    className="bg-zinc-800 border-zinc-600 text-white pr-16"
                  />
                  {borrowState.asset && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      {borrowState.asset.symbol}
                    </div>
                  )}
                </div>
              </div>

              {borrowState.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{borrowState.error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBorrow}
                disabled={borrowState.isLoading || !borrowState.asset || !borrowState.amount || !hasSuppliedAssets || isPoolFrozen}
                className="w-full bg-[#a78bfa] hover:bg-[#9333ea] text-white"
              >
                {borrowState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Borrowing...
                  </>
                ) : (
                  "Borrow Asset"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Withdraw your supplied collateral from the pool. Make sure your health factor stays above 1 after withdrawal.
            </AlertDescription>
          </Alert>
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Withdraw Collateral</CardTitle>
              <CardDescription>Remove previously supplied assets from the pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-asset" className="text-white">Asset</Label>
                <Select
                  value={withdrawState.asset?.symbol || ""}
                  onValueChange={(value) => {
                    const asset = BLEND_ASSETS.find(a => a.symbol === value)
                    setWithdrawState(prev => ({ ...prev, asset: asset || null, error: null }))
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {BLEND_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="text-white hover:bg-zinc-700">
                        <div className="flex items-center gap-2">
                          <span>{asset.symbol}</span>
                          <span className="text-zinc-400">({asset.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount" className="text-white">Amount</Label>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawState.amount}
                    onChange={(e) => setWithdrawState(prev => ({ ...prev, amount: e.target.value, error: null }))}
                    className="bg-zinc-800 border-zinc-600 text-white pr-16"
                  />
                  {withdrawState.asset && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      {withdrawState.asset.symbol}
                    </div>
                  )}
                </div>
              </div>
              {withdrawState.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{withdrawState.error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleWithdraw}
                disabled={withdrawState.isLoading || !withdrawState.asset || !withdrawState.amount}
                className="w-full bg-[#a78bfa] hover:bg-[#9333ea] text-white"
              >
                {withdrawState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  "Withdraw Asset"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repay" className="space-y-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Repay your outstanding loan to reduce debt and improve your health factor.
            </AlertDescription>
          </Alert>
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Repay Loan</CardTitle>
              <CardDescription>Pay back borrowed assets to the pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repay-asset" className="text-white">Asset</Label>
                <Select
                  value={repayState.asset?.symbol || ""}
                  onValueChange={(value) => {
                    const asset = BLEND_ASSETS.find(a => a.symbol === value)
                    setRepayState(prev => ({ ...prev, asset: asset || null, error: null }))
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {BLEND_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="text-white hover:bg-zinc-700">
                        <div className="flex items-center gap-2">
                          <span>{asset.symbol}</span>
                          <span className="text-zinc-400">({asset.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repay-amount" className="text-white">Amount</Label>
                <div className="relative">
                  <Input
                    id="repay-amount"
                    type="number"
                    placeholder="0.00"
                    value={repayState.amount}
                    onChange={(e) => setRepayState(prev => ({ ...prev, amount: e.target.value, error: null }))}
                    className="bg-zinc-800 border-zinc-600 text-white pr-16"
                  />
                  {repayState.asset && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      {repayState.asset.symbol}
                    </div>
                  )}
                </div>
              </div>
              {repayState.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{repayState.error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleRepay}
                disabled={repayState.isLoading || !repayState.asset || !repayState.amount}
                className="w-full bg-[#a78bfa] hover:bg-[#9333ea] text-white"
              >
                {repayState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Repaying...
                  </>
                ) : (
                  "Repay Loan"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div className="flex items-center gap-3">
                    {tx.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : tx.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">
                        {tx.type === "supply" ? "Supplied" : tx.type === "borrow" ? "Borrowed" : tx.type === "withdraw" ? "Withdrew" : "Repaid"} {tx.amount} {tx.asset}
                      </p>
                      <p className="text-zinc-400 text-xs">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {tx.hash && (
                    <a
                      href={`https://stellar.expert/explorer/public/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a78bfa] hover:underline text-xs"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Mismatch Dialog */}
      {account && (
        <NetworkMismatchDialog
          open={showNetworkMismatch}
          onOpenChange={setShowNetworkMismatch}
          walletNetwork={account.network}
          appNetwork={profileNetwork}
          onSwitchApp={() => {
            setNetwork(account.network as "mainnet" | "testnet")
            setShowNetworkMismatch(false)
            toast.success(`Switched app to ${account.network}`)
          }}
          onDisconnect={() => {
            disconnect()
            setShowNetworkMismatch(false)
            toast.success("Wallet disconnected")
          }}
        />
      )}
    </div>
  )
}