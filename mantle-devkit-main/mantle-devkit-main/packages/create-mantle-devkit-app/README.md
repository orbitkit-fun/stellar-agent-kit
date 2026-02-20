# create-mantle-devkit-app

The official CLI for scaffolding production-ready applications on Mantle Network.

Build DeFi applications with the Agent Kit SDK or monetize APIs with x402 pay-per-request payments. One command to get started.

```bash
npx create-mantle-devkit-app my-app
```

## What You Can Build

### Agent Kit - DeFi Applications

Build decentralized finance applications powered by the Mantle Agent Kit SDK. The template provides a complete token swap interface with real-time price quotes and multi-protocol support.

**Integrated Protocols:**

| Protocol | Type | Description |
|----------|------|-------------|
| Agni Finance | DEX | Primary DEX on Mantle with concentrated liquidity pools |
| Merchant Moe | Liquidity Book | Liquidity Book DEX offering zero-slippage trades within bins |
| OpenOcean | Aggregator | DEX aggregator that routes through multiple sources for best prices |

**Supported Tokens:**

| Token | Address | Decimals |
|-------|---------|----------|
| MNT | Native | 18 |
| WMNT | 0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8 | 18 |
| USDT | 0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE | 6 |
| USDC | 0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9 | 6 |
| WETH | 0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111 | 18 |
| mETH | 0xcDA86A272531e8640cD7F1a92c01839911B90bB0 | 18 |

**Features:**
- Real-time price quotes via Pyth Oracle integration
- Wallet connection with MetaMask and WalletConnect
- Transaction building and execution
- Slippage protection
- Multi-protocol routing

### x402 - Pay-Per-Request APIs

Monetize your APIs using the HTTP 402 Payment Required standard. Users pay per request using MNT tokens on Mantle Network. No subscriptions, no API keys to manage.

**How It Works:**

1. Server returns `402 Payment Required` with payment details
2. Client wallet signs and sends the payment
3. Server verifies payment and returns the response
4. Payments settle instantly on Mantle Network

**Template Variants:**

| Template | Stack | Use Case |
|----------|-------|----------|
| fullstack-hono | Next.js + Hono | Full application with UI and API |
| fullstack-express | Next.js + Express | Full application with Express-style routes |
| backend-hono | Hono | Standalone API server, lightweight |
| backend-express | Express | Standalone API server, mature ecosystem |

**Included Endpoints:**
- `/api/info` - Free endpoint, no payment required
- `/api/premium` - Paid endpoint (0.001 MNT per request)
- `/api/weather` - Paid endpoint (0.0005 MNT per request)

## Installation

No global installation required. Run directly with npx:

```bash
npx create-mantle-devkit-app [project-name]
```

## Usage

### Interactive Mode

```bash
npx create-mantle-devkit-app
```

Prompts for:
- Project name
- Template type (Agent Kit or x402)
- Framework preference (for x402)
- Package manager

### Command Line

```bash
# Agent Kit DeFi template
npx create-mantle-devkit-app my-defi-app --agent-kit

# x402 fullstack with Hono
npx create-mantle-devkit-app my-api --fullstack --hono

# x402 backend only with Express
npx create-mantle-devkit-app my-api --backend --express

# Specify package manager
npx create-mantle-devkit-app my-app --pnpm
npx create-mantle-devkit-app my-app --bun

# Skip dependency installation
npx create-mantle-devkit-app my-app --skip-install
```

## CLI Options

| Flag | Description |
|------|-------------|
| `--agent-kit` | Scaffold Agent Kit DeFi template |
| `--fullstack` | Scaffold fullstack x402 template |
| `--backend` | Scaffold backend-only x402 template |
| `--hono` | Use Hono framework |
| `--express` | Use Express framework |
| `--npm` | Use npm as package manager |
| `--yarn` | Use yarn as package manager |
| `--pnpm` | Use pnpm as package manager |
| `--bun` | Use bun as package manager |
| `--skip-install` | Skip automatic dependency installation |

## Project Structure

### Agent Kit Template

```
my-defi-app/
├── src/
│   ├── app/
│   │   ├── api/swap/route.ts    # Quote and swap endpoints
│   │   ├── page.tsx             # Swap interface
│   │   └── layout.tsx
│   ├── components/
│   │   ├── swap-form.tsx        # Main swap component
│   │   └── transaction-result.tsx
│   └── lib/
│       └── tokens.ts            # Token configuration
├── public/                      # Protocol logos
└── package.json
```

### x402 Template

```
my-api/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── info/route.ts    # Free endpoint
│   │   │   ├── premium/route.ts # Paid endpoint
│   │   │   └── weather/route.ts # Paid endpoint
│   │   ├── page.tsx             # Demo UI
│   │   └── layout.tsx
│   └── components/
└── package.json
```

## Configuration

### Agent Kit

```env
# .env
PRIVATE_KEY=your-private-key-here
NEXT_PUBLIC_NETWORK=mainnet
```

### x402

```env
# .env
X402_APP_ID=your-app-id
X402_PLATFORM_URL=https://mantle-devkit.vercel.app
```

## Requirements

- Node.js 18 or higher
- A wallet with MNT tokens for gas fees
- MetaMask or any EVM-compatible wallet

## Documentation

- [Mantle DevKit Documentation](https://mantle-devkit.vercel.app/docs-demo)
- [Mantle Network](https://mantle.xyz)
- [Agni Finance](https://agni.finance)
- [Merchant Moe](https://merchantmoe.com)
- [OpenOcean](https://openocean.finance)

## License

MIT
