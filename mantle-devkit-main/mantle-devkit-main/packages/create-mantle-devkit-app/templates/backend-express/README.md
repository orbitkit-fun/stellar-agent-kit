# x402 Backend - Express

Robust API server with pay-per-request endpoints using x402 on Mantle Network.

## Overview

Standalone Express server built for:
- Production-grade reliability
- Extensive middleware ecosystem
- Familiar Express patterns

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
import { x402Express } from 'x402-mantle-sdk/server'

app.get(
  '/api/my-endpoint',
  x402Express({ price: '0.01', token: 'MNT', testnet: true }),
  (req, res) => {
    console.log('Payment verified:', req.x402.transactionHash)
    res.json({ data: 'Your premium content' })
  }
)
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

Works with any Node.js hosting:
- Railway
- Render
- AWS EC2 / Lambda
- Google Cloud Run
- DigitalOcean App Platform

## Documentation

- [Mantle DevKit Docs](https://mantle-devkit.vercel.app/docs-demo)
- [Express Documentation](https://expressjs.com)

## License

MIT
