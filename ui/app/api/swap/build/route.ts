import { NextRequest, NextResponse } from 'next/server'
import { SoroSwapClient } from '@/lib/agent-kit/defi/soroSwapClient'
import { getNetworkConfig } from '@/lib/agent-kit/config/networks'

export async function POST(request: NextRequest) {
  try {
    const { quote, fromAddress } = await request.json()

    if (!quote || !fromAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: quote, fromAddress' },
        { status: 400 }
      )
    }

    const networkConfig = getNetworkConfig()
    const apiKey = process.env.SOROSWAP_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "SOROSWAP_API_KEY is required to build swap transaction. Set it in the server .env to enable swap execution (quote works without it).",
        },
        { status: 500 }
      );
    }

    const soroSwapClient = new SoroSwapClient(networkConfig, apiKey)
    const { xdr } = await soroSwapClient.buildSwapTransaction(
      quote,
      fromAddress,
      "mainnet"
    )

    return NextResponse.json({ xdr })
  } catch (error) {
    console.error('Build swap error:', error)
    const message = error instanceof Error ? error.message : 'Failed to build swap'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
