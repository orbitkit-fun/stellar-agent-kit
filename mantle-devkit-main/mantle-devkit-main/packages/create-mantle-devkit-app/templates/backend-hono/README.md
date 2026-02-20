# x402 Backend - Hono

Lightweight API server with pay-per-request endpoints using x402 on Mantle Network.

## Overview

Standalone Hono server optimized for:
- Minimal footprint and fast cold starts
- Edge runtime compatibility
- Simple middleware-based payment integration

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Server runs at [http://localhost:3000](http://localhost:3000)

## Configuration

Get your App ID from the [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app):

```env
X402_APP_ID=your_app_id_here
X402_PLATFORM_URL=https://mantle-devkit.vercel.app
```

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /` | Free | API information |
| `GET /api/premium` | 0.001 MNT | Premium content |
| `GET /api/weather` | 0.0005 MNT | Weather data |

## Adding Paid Endpoints

```typescript
import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/my-endpoint', x402({
  price: '0.01',
  token: 'MNT',
  testnet: true
}))

app.get('/api/my-endpoint', (c) => {
  return c.json({ data: 'Your premium content' })
})
```

## Payment Options

| Option | Type | Description |
|--------|------|-------------|
| `price` | string | Amount to charge |
| `token` | string | MNT, USDC, or USDT |
| `testnet` | boolean | true for Mantle Sepolia |

## Production

```bash
npm run build
npm start
```

## Deployment

Works with any Node.js or edge hosting:
- Cloudflare Workers
- Vercel Edge Functions
- AWS Lambda
- Deno Deploy

## Documentation

- [Mantle DevKit Docs](https://mantle-devkit.vercel.app/docs-demo)
- [Hono Documentation](https://hono.dev)

## License

MIT
