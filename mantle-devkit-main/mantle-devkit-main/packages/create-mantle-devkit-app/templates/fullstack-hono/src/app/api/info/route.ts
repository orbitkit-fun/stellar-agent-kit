import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Welcome to x402 API',
    endpoints: {
      free: 'GET /api/info',
      paid: 'GET /api/premium (0.001 MNT)',
      paidWeather: 'GET /api/weather (0.0005 MNT)',
    },
    network: 'mantle-sepolia',
    documentation: 'https://mantle-x402.vercel.app',
  })
}
