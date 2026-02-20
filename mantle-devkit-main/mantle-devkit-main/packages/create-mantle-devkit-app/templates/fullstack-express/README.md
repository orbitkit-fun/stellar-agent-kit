# x402 Fullstack Template - Express

Next.js application with pay-per-request API endpoints using the HTTP 402 protocol on Mantle Network.

## Overview

This template provides a complete fullstack application with:
- Next.js 14 frontend with wallet connection UI
- Express-style API routes with x402 payment middleware
- Pre-configured paid and free endpoints
- Payment modal integration

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Configuration

Get your App ID from the [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app):

```env
X402_APP_ID=your_app_id_here
X402_PLATFORM_URL=https://mantle-devkit.vercel.app
```

## API Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/info` | Free | API information |
| `GET /api/premium` | 0.001 MNT | Premium content |
| `GET /api/weather` | 0.0005 MNT | Weather data |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── info/route.ts       # Free endpoint
│   │   ├── premium/route.ts    # Paid endpoint
│   │   └── weather/route.ts    # Paid endpoint
│   ├── page.tsx                # Demo frontend
│   └── layout.tsx
├── components/                 # UI components
└── lib/
```

## Creating Paid Endpoints

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { processPaymentMiddleware, initializePlatform } from 'x402-mantle-sdk/server'

let initialized = false

export async function GET(request: NextRequest) {
  if (!initialized) {
    await initializePlatform()
    initialized = true
  }

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const result = await processPaymentMiddleware(
    { price: '0.01', token: 'MNT', testnet: true },
    headers
  )

  if (result.paymentRequired) {
    const response = NextResponse.json(result.paymentRequired.body, { status: 402 })
    Object.entries(result.paymentRequired.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  if (result.allowed) {
    return NextResponse.json({ data: 'Your premium content' })
  }

  return NextResponse.json({ error: 'Error' }, { status: 500 })
}
```

## Payment Options

```typescript
const options = {
  price: '0.001',           // Amount in tokens
  token: 'MNT',             // MNT, USDC, or USDT
  testnet: true,            // false for mainnet
}
```

## HTTP 402 Flow

```
1. Client: GET /api/premium
2. Server: 402 Payment Required (with payment details)
3. Client: Makes on-chain payment
4. Client: GET /api/premium (with X-402-Transaction-Hash header)
5. Server: 200 OK (returns content)
```

## Networks

| Network | Chain ID | Use |
|---------|----------|-----|
| Mantle | 5000 | Production |
| Mantle Sepolia | 5003 | Testing |

## Deployment

```bash
npm run build
vercel deploy
```

Set environment variables in your deployment platform.

## Documentation

- [Mantle DevKit Docs](https://mantle-devkit.vercel.app/docs-demo)
- [Mantle Network](https://mantle.xyz)

## License

MIT
