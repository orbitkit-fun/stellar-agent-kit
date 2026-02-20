import { NextRequest, NextResponse } from "next/server"
import { parseUnits, encodeFunctionData, erc20Abi, createPublicClient, http } from "viem"
import { mantle } from "viem/chains"

// Contract addresses for Mantle mainnet
const AGNI_SWAP_ROUTER = "0x319B69888b0d11cEC22caA5034e25FfFBDc88421"
const MERCHANTMOE_LB_ROUTER = "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a"
const WMNT = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"
const OPENOCEAN_BASE_URL = "https://open-api.openocean.finance/v4/mantle"

// ABIs
const AGNI_SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const

const MERCHANTMOE_ROUTER_ABI = [
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      {
        name: "path",
        type: "tuple",
        components: [
          { name: "pairBinSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "tokenPath", type: "address[]" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactNATIVEForTokens",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const

// Helper to check if native token
function isNativeToken(address: string): boolean {
  return (
    address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
    address === "0x0000000000000000000000000000000000000000"
  )
}

// Create public client for reading contract data
const publicClient = createPublicClient({
  chain: mantle,
  transport: http(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, tokenIn, tokenOut, amount, slippage, feeTier, walletAddress } = body

    // Validate required fields
    if (!protocol || !tokenIn || !tokenOut || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: protocol, tokenIn, tokenOut, amount" },
        { status: 400 }
      )
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required for transaction" },
        { status: 400 }
      )
    }

    // Get token decimals
    let decimals = 18
    if (!isNativeToken(tokenIn)) {
      try {
        decimals = await publicClient.readContract({
          address: tokenIn as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        })
      } catch (e) {
        console.error("Failed to get decimals, using 18:", e)
      }
    }

    const amountInWei = parseUnits(amount, decimals)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
    const slippagePercent = slippage || 1
    const isNativeIn = isNativeToken(tokenIn)
    const actualTokenIn = isNativeIn ? WMNT : tokenIn

    let txData: { to: string; data: string; value: string }
    let outAmount: string | undefined

    switch (protocol) {
      case "agni": {
        const data = encodeFunctionData({
          abi: AGNI_SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [
            {
              tokenIn: actualTokenIn as `0x${string}`,
              tokenOut: (isNativeToken(tokenOut) ? WMNT : tokenOut) as `0x${string}`,
              fee: feeTier || 500,
              recipient: walletAddress as `0x${string}`,
              deadline,
              amountIn: amountInWei,
              amountOutMinimum: BigInt(0),
              sqrtPriceLimitX96: BigInt(0),
            },
          ],
        })

        txData = {
          to: AGNI_SWAP_ROUTER,
          data,
          value: isNativeIn ? `0x${amountInWei.toString(16)}` : "0x0",
        }
        break
      }

      case "merchantmoe": {
        const binStep = feeTier || 15
        const path = {
          pairBinSteps: [BigInt(binStep)],
          versions: [2], // V2_1
          tokenPath: isNativeIn
            ? [WMNT, tokenOut]
            : [tokenIn, tokenOut],
        }

        const data = encodeFunctionData({
          abi: MERCHANTMOE_ROUTER_ABI,
          functionName: "swapExactNATIVEForTokens",
          args: [BigInt(0), path, walletAddress as `0x${string}`, deadline],
        })

        txData = {
          to: MERCHANTMOE_LB_ROUTER,
          data,
          value: isNativeIn ? `0x${amountInWei.toString(16)}` : "0x0",
        }
        break
      }

      case "openocean": {
        // Use OpenOcean API to get swap data
        const params = new URLSearchParams({
          inTokenAddress: tokenIn,
          outTokenAddress: tokenOut,
          amount: amount,
          gasPrice: "5",
          slippage: slippagePercent.toString(),
          account: walletAddress,
        })

        const response = await fetch(`${OPENOCEAN_BASE_URL}/swap?${params}`)
        const data = await response.json()

        if (data.code !== 200) {
          throw new Error(data.message || "OpenOcean API error")
        }

        txData = {
          to: data.data.to,
          data: data.data.data,
          value: data.data.value || "0x0",
        }
        outAmount = data.data.outAmount
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown protocol: ${protocol}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      txData,
      outAmount,
      network: "mainnet",
    })
  } catch (error) {
    console.error("Swap error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to prepare swap",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// Pyth price feed IDs for Mantle tokens (from pyth.network/developers/price-feed-ids)
const PYTH_PRICE_IDS: Record<string, string> = {
  // WMNT - MNT/USD price feed
  "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8": "0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585",
  // USDT - USDT/USD price feed
  "0x201eba5cc46d216ce6dc03f6a759e8e766e956ae": "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
  // USDC - USDC/USD price feed
  "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9": "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
  // WETH - ETH/USD price feed
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  // mETH - mETH/USD price feed
  "0xcda86a272531e8640cd7f1a92c01839911b90bb0": "0x4c9c6f9f0cde13fced52dc1927c8c06a91b1a65ab77b9e1ec1c614963ce90dd4",
}

// Get Pyth price for a token
async function getPythPrice(tokenAddress: string): Promise<number> {
  const priceId = PYTH_PRICE_IDS[tokenAddress.toLowerCase()]
  if (!priceId) {
    throw new Error(`No Pyth price feed for token: ${tokenAddress}`)
  }

  const response = await fetch(
    `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${priceId}`
  )
  const data = await response.json()

  if (!data.parsed || data.parsed.length === 0) {
    throw new Error("Failed to get price from Pyth")
  }

  const priceData = data.parsed[0].price
  const price = Number(priceData.price) * Math.pow(10, priceData.expo)
  return price
}

// GET endpoint to fetch quote using Pyth oracle prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenIn = searchParams.get("tokenIn")
    const tokenOut = searchParams.get("tokenOut")
    const amount = searchParams.get("amount")

    if (!tokenIn || !tokenOut || !amount) {
      return NextResponse.json(
        { error: "Missing required params: tokenIn, tokenOut, amount" },
        { status: 400 }
      )
    }

    // Normalize addresses for Pyth lookup
    const actualTokenIn = isNativeToken(tokenIn) ? WMNT : tokenIn
    const actualTokenOut = isNativeToken(tokenOut) ? WMNT : tokenOut

    // Get prices from Pyth oracle (no private key needed!)
    const [priceIn, priceOut] = await Promise.all([
      getPythPrice(actualTokenIn),
      getPythPrice(actualTokenOut),
    ])

    const inputAmount = parseFloat(amount)

    // Calculate: (inputAmount * priceIn) / priceOut = outputAmount
    const outputAmount = (inputAmount * priceIn) / priceOut

    return NextResponse.json({
      success: true,
      inAmount: amount,
      outAmount: outputAmount.toString(),
      priceIn,
      priceOut,
    })
  } catch (error) {
    console.error("Quote error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get quote" },
      { status: 500 }
    )
  }
}
