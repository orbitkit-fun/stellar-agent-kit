import { NextRequest, NextResponse } from 'next/server'
import { processPaymentMiddleware, initializePlatform, clearCache } from 'x402-mantle-sdk/server'

// Configuration - Set these in your .env file
const appId = process.env.X402_APP_ID || ''
const platformUrl = process.env.X402_PLATFORM_URL || 'https://mantle-x402.vercel.app'

if (!process.env.X402_APP_ID) {
  process.env.X402_APP_ID = appId
}
if (!process.env.X402_PLATFORM_URL) {
  process.env.X402_PLATFORM_URL = platformUrl
}

let initialized = false
let initError: Error | null = null

const initPlatform = async () => {
  try {
    await initializePlatform()
    initialized = true
    initError = null
  } catch (error) {
    initError = error as Error
    console.error('Platform initialization failed:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize platform on first request
    if (!initialized && !initError) {
      await initPlatform()
    } else if (initError) {
      try { clearCache() } catch {}
      initError = null
      await initPlatform()
    }

    if (initError) {
      return NextResponse.json(
        { error: 'Platform initialization failed', details: (initError as Error).message },
        { status: 500 }
      )
    }

    // Payment options - cheaper for weather
    const paymentOptions = {
      price: '0.0005',
      token: 'MNT',
      testnet: true,
    }

    // Convert headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Process payment middleware
    const result = await processPaymentMiddleware(paymentOptions, headers)

    // Payment required - return 402
    if (result.paymentRequired) {
      const response = NextResponse.json(result.paymentRequired.body, { status: 402 })
      Object.entries(result.paymentRequired.headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Error
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    // Payment verified - return weather data
    if (result.allowed) {
      return NextResponse.json({
        success: true,
        data: {
          location: 'New York',
          temperature: 72,
          unit: 'F',
          condition: 'Sunny',
          humidity: 45,
          forecast: ['Sunny', 'Partly Cloudy', 'Rain'],
        },
      })
    }

    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  } catch (error) {
    console.error('Error in weather route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
