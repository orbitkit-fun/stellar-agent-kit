/**
 * Blend lending integration – supply and borrow via Blend Protocol on Stellar.
 * Uses @blend-capital/blend-sdk. Pool IDs: see docs.blend.capital/mainnet-deployments
 */

import {
  Keypair,
  TransactionBuilder,
  Transaction,
  Networks,
  xdr,
  rpc,
  Horizon,
} from "@stellar/stellar-sdk";
import { PoolContractV2, RequestType, type Request } from "@blend-capital/blend-sdk";
import type { NetworkConfig } from "../config/networks.js";

/** Mainnet Blend pool ID. More at mainnet.blend.capital */
export const BLEND_POOLS_MAINNET = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS" as const;

/** @deprecated Use BLEND_POOLS_MAINNET. Kept for compatibility. */
export const BLEND_POOLS = { mainnet: BLEND_POOLS_MAINNET } as const;

export interface LendingSupplyArgs {
  /** Pool contract ID (C...). */
  poolId: string;
  /** Reserve asset contract ID (e.g. USDC, XLM token contract). */
  assetContractId: string;
  /** Amount in asset's smallest unit (e.g. 7 decimals for USDC). */
  amount: string;
}

export interface LendingBorrowArgs {
  poolId: string;
  assetContractId: string;
  amount: string;
}

export interface LendingResult {
  hash: string;
  status: string;
}

async function buildSubmitTx(
  networkConfig: NetworkConfig,
  secretKey: string,
  poolId: string,
  requests: Request[]
): Promise<{ tx: Transaction; keypair: Keypair }> {
  const keypair = Keypair.fromSecret(secretKey.trim());
  const user = keypair.publicKey();
  const pool = new PoolContractV2(poolId);
  const submitOpXdr = pool.submit({
    from: user,
    spender: user,
    to: user,
    requests,
  });
  const op = xdr.Operation.fromXDR(submitOpXdr, "base64");
  const networkPassphrase = Networks.PUBLIC;
  const horizon = new Horizon.Server(networkConfig.horizonUrl);
  const sourceAccount = await horizon.loadAccount(user);
  const tx = new TransactionBuilder(sourceAccount, {
    fee: "10000",
    networkPassphrase,
  })
    .addOperation(op)
    .setTimeout(180)
    .build();
  return { tx, keypair };
}

/**
 * Supply (deposit) an asset to a Blend pool as collateral or liquidity.
 */
export async function lendingSupply(
  networkConfig: NetworkConfig,
  secretKey: string,
  args: LendingSupplyArgs
): Promise<LendingResult> {
  const amountBigInt = BigInt(args.amount);
  const requests: Request[] = [
    {
      request_type: RequestType.SupplyCollateral,
      address: args.assetContractId,
      amount: amountBigInt,
    },
  ];
  const { tx, keypair } = await buildSubmitTx(
    networkConfig,
    secretKey,
    args.poolId,
    requests
  );
  const server = new rpc.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:"),
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend supply failed: ${String(sendResult.errorResult)}`);
  }
  return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
}

/**
 * Borrow an asset from a Blend pool.
 */
export async function lendingBorrow(
  networkConfig: NetworkConfig,
  secretKey: string,
  args: LendingBorrowArgs
): Promise<LendingResult> {
  const amountBigInt = BigInt(args.amount);
  const requests: Request[] = [
    {
      request_type: RequestType.Borrow,
      address: args.assetContractId,
      amount: amountBigInt,
    },
  ];
  const { tx, keypair } = await buildSubmitTx(
    networkConfig,
    secretKey,
    args.poolId,
    requests
  );
  const server = new rpc.Server(networkConfig.sorobanRpcUrl, {
    allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:"),
  });
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.errorResult) {
    throw new Error(`Blend borrow failed: ${String(sendResult.errorResult)}`);
  }
  return { hash: sendResult.hash, status: sendResult.status ?? "PENDING" };
}
