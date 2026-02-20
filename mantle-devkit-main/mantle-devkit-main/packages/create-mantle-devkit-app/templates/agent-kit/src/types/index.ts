export interface SwapRequest {
  protocol: "agni" | "merchantmoe" | "openocean"
  tokenIn: string
  tokenOut: string
  amount: string
  slippage?: number
  feeTier?: number
}

export interface SwapResult {
  success: boolean
  txHash?: string
  outAmount?: string
  explorerUrl?: string
  network?: string
  error?: string
}

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logoUrl?: string
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}
