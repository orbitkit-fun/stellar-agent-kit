import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { x402 } from 'x402-mantle-sdk/server'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Free endpoint - API info
app.get('/', (c) => {
  return c.json({
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
app.use('/api/premium', x402({ price: '0.001', token: 'MNT', testnet: true }))
app.get('/api/premium', (c) => {
  return c.json({
    success: true,
    message: 'Premium content unlocked!',
    data: {
      secret: 'This is premium data that required payment.',
      timestamp: new Date().toISOString(),
    },
  })
})

// Weather endpoint - requires 0.0005 MNT
app.use('/api/weather', x402({ price: '0.0005', token: 'MNT', testnet: true }))
app.get('/api/weather', (c) => {
  return c.json({
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
})

// Start server
const port = Number(process.env.PORT) || 3000

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    x402 Hono Server                        ║
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

serve({ fetch: app.fetch, port })
