/**
 * Portfolio Tracker & Transaction History types for Stellar Agent Kit
 */

export interface PortfolioAsset {
  assetCode: string;
  issuer?: string;
  balance: string;
  limit?: string;
  priceUsd?: number;
  valueUsd?: number;
}

export interface PortfolioSummary {
  accountId: string;
  totalValueUsd: number;
  assets: PortfolioAsset[];
  nativeBalance: string;
  nativeValueUsd: number;
  trustlineCount: number;
  lastUpdated: number;
}

export interface TransactionRecord {
  id: string;
  hash: string;
  ledger: number;
  createdAt: string;
  sourceAccount: string;
  feeCharged: string;
  operationCount: number;
  memo?: string;
  memoType?: string;
  successful: boolean;
}

export interface PaymentRecord {
  id: string;
  transactionHash: string;
  type: 'payment' | 'create_account' | 'path_payment' | 'path_payment_strict_send';
  from: string;
  to: string;
  assetCode: string;
  assetIssuer?: string;
  amount: string;
  createdAt: string;
}

export interface TransactionHistoryOptions {
  limit?: number;
  cursor?: string;
  order?: 'asc' | 'desc';
  includeFailed?: boolean;
}

export interface PaymentHistoryOptions {
  limit?: number;
  cursor?: string;
  order?: 'asc' | 'desc';
}

export interface PortfolioChange {
  assetCode: string;
  previousBalance: string;
  currentBalance: string;
  change: string;
  changePercent: number;
}

export interface PortfolioSnapshot {
  accountId: string;
  timestamp: number;
  assets: Array<{
    assetCode: string;
    balance: string;
    issuer?: string;
  }>;
}
