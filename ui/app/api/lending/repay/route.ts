import { NextRequest, NextResponse } from "next/server"
import {
  TransactionBuilder,
  Networks,
  xdr,
  Horizon,
  rpc,
} from "@stellar/stellar-sdk"
import { PoolContractV2, RequestType, type Request } from "@blend-capital/blend-sdk"
import { getNetworkConfig } from "stellar-agent-kit"
import { requireActivePlan } from "@/lib/require-active-plan"

/** Default active pool (FixedV2). */
const DEFAULT_POOL_ID = "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD"

/** Amount in human form (e.g. "10") → smallest units (7 decimals) for Stellar assets. */
function toSmallestUnits(amount: string): string {
  const num = parseFloat(amount)
  if (!Number.isFinite(num) || num < 0) {
    throw new Error("Invalid amount")
  }
  const scaled = Math.round(num * 1e7).toString()
  return scaled
}

export async function POST(request: NextRequest) {
  const auth = requireActivePlan(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { publicKey, asset, amount, network = "mainnet", poolId } = await request.json()

    if (!publicKey || !asset || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: publicKey, asset, amount" },
        { status: 400 }
      )
    }

    // Blend Protocol is mainnet-only
    if (network === "testnet") {
      return NextResponse.json(
        { error: "Blend Protocol lending is only available on mainnet. Please switch to mainnet to use lending features." },
        { status: 400 }
      )
    }

    const assetContractId = String(asset).trim()
    const amountInSmallestUnit = toSmallestUnits(String(amount))
    const amountBigInt = BigInt(amountInSmallestUnit)

    if (amountBigInt <= 0n) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    const networkConfig = getNetworkConfig(network)
    const effectivePoolId = (typeof poolId === "string" && poolId.trim()) ? poolId.trim() : DEFAULT_POOL_ID
    const pool = new PoolContractV2(effectivePoolId)

    const requests: Request[] = [
      {
        request_type: RequestType.Repay,
        address: assetContractId,
        amount: amountBigInt,
      },
    ]

    const submitOpXdr = pool.submit({
      from: publicKey,
      spender: publicKey,
      to: publicKey,
      requests,
    })

    const op = xdr.Operation.fromXDR(submitOpXdr, "base64")
    const networkPassphrase = Networks.PUBLIC
    const horizon = new Horizon.Server(networkConfig.horizonUrl)
    const sourceAccount = await horizon.loadAccount(publicKey)

    const tx = new TransactionBuilder(sourceAccount, {
      fee: "10000",
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(180)
      .build()

    const server = new rpc.Server(networkConfig.sorobanRpcUrl, {
      allowHttp: networkConfig.sorobanRpcUrl.startsWith("http:"),
    })
    const prepared = await server.prepareTransaction(tx)

    return NextResponse.json({
      xdr: prepared.toXDR(),
      asset: assetContractId,
      amount: amountInSmallestUnit,
      operation: "repay",
    })
  } catch (error) {
    console.error("Repay API error:", error)
    const message = error instanceof Error ? error.message : "Failed to build repay transaction"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
