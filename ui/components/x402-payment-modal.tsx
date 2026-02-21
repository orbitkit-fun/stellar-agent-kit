'use client'

/**
 * Modal for HTTP 402 Payment Required: shows Stellar payment details and lets the user
 * complete payment (paste tx hash or use a custom "Pay with Stellar" action from the parent).
 * Use with x402Fetch from x402-stellar-sdk/client: on 402, show this modal; when the user
 * pays and you have the transaction hash, call onPaymentComplete(txHash) and retry the request.
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Matches X402PaymentRequest from x402-stellar-sdk/client. */
export interface X402PaymentRequest {
  amount: string
  assetCode: string
  issuer?: string
  network: string
  destination: string
  memo?: string
}

interface X402PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Payment details from the 402 response. */
  request: X402PaymentRequest | null
  /** Call with the transaction hash after the user has paid. */
  onPaymentComplete: (transactionHash: string) => void
  /** Optional: custom content (e.g. "Pay with Stellar" button that uses Freighter). If not provided, a "Paste transaction hash" input is shown. */
  children?: React.ReactNode
}

export function X402PaymentModal({
  open,
  onOpenChange,
  request,
  onPaymentComplete,
  children,
}: X402PaymentModalProps) {
  const [txHash, setTxHash] = React.useState('')

  const handleSubmitHash = (e: React.FormEvent) => {
    e.preventDefault()
    const hash = txHash.trim()
    if (hash) {
      onPaymentComplete(hash)
      setTxHash('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Payment required</DialogTitle>
          <DialogDescription>
            Send the requested Stellar payment, then paste the transaction hash below or use your wallet.
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
            <p><span className="text-muted-foreground">Amount:</span> {request.amount} {request.assetCode}</p>
            <p><span className="text-muted-foreground">Network:</span> {request.network}</p>
            <p><span className="text-muted-foreground">Destination:</span> <code className="break-all">{request.destination}</code></p>
            {request.memo && <p><span className="text-muted-foreground">Memo:</span> {request.memo}</p>}
          </div>
        )}
        {children ?? (
          <form onSubmit={handleSubmitHash} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tx-hash">Transaction hash (after you pay)</Label>
              <Input
                id="tx-hash"
                placeholder="e.g. abc123..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <LiquidMetalButton
                type="submit"
                label="Submit & retry"
                disabled={!txHash.trim()}
                width={140}
              />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
