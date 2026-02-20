import express from 'express'
import cors from 'cors'
import { x402Express } from 'x402-mantle-sdk/server'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Free endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'x402 API',
    version: '1.0.0',
    endpoints: {
      info: 'GET / - API information (free)',
      premium: 'GET /api/premium - Premium content (0.001 MNT)',
      weather: 'GET /api/weather - Weather data (0.0005 MNT)',
    },
    network: 'mantle-sepolia',
    docs: 'https://mantle-x402.vercel.app',
  })
})

// Premium endpoint - requires 0.001 MNT
app.get(
  '/api/premium',
  x402Express({ price: '0.001', token: 'MNT', testnet: true }),
  (req, res) => {
    res.json({
      success: true,
      message: 'Premium content unlocked!',
      data: {
        secret: 'This is premium data that required payment.',
        timestamp: new Date().toISOString(),
      },
    })
  }
)

// Weather endpoint - requires 0.0005 MNT
app.get(
  '/api/weather',
  x402Express({ price: '0.0005', token: 'MNT', testnet: true }),
  (req, res) => {
    res.json({
      success: true,
      weather: {
        location: 'San Francisco, CA',
        temperature: 72,
        unit: 'fahrenheit',
        conditions: 'Sunny',
        humidity: 45,
        wind: '10 mph NW',
      },
    })
  }
)

// Start server
const port = Number(process.env.PORT) || 3000

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   x402 Express Server                      ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${port}                    ║
║                                                             ║
║  Endpoints:                                                 ║
║    GET  /              - API info (free)                   ║
║    GET  /api/premium   - Premium content (0.001 MNT)       ║
║    GET  /api/weather   - Weather data (0.0005 MNT)         ║
║                                                             ║
║  Network: mantle-sepolia (testnet)                         ║
╚═══════════════════════════════════════════════════════════╝
  `)
})
