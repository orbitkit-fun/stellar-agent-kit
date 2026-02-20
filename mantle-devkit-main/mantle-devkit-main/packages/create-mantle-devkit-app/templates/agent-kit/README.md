# Mantle Agent Kit - Swap Demo

A production-ready Next.js application demonstrating token swaps on Mantle Network using the Mantle Agent Kit SDK.

## What is this

This is a DeFi swap interface that allows users to swap tokens on Mantle Network. It connects to your wallet, fetches real-time quotes using the Mantle Agent Kit, and executes swaps through multiple DEX protocols.

Currently, 3 protocols are integrated:

- **Agni Finance** - Primary DEX on Mantle with deep liquidity
- **Merchant Moe** - Liquidity Book DEX with competitive rates
- **OpenOcean** - DEX aggregator for best prices

To add more protocols or features, refer to the [Mantle Agent Kit Documentation](https://mantle-devkit.vercel.app/docs-demo).

## Setup

### Prerequisites

- Node.js 18 or higher
- A wallet with MNT tokens for gas fees
- MetaMask or any EVM-compatible wallet

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
# Your wallet private key (required for swap execution)
PRIVATE_KEY=your-private-key-here

# Network: "mainnet" or "testnet"
NEXT_PUBLIC_NETWORK=mainnet
```

Note: The private key is only used server-side for preparing transactions. Never expose it to the client.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Connect your wallet using the Connect button
2. Select a protocol (Agni, Merchant Moe, or OpenOcean)
3. Choose input and output tokens
4. Enter the amount to swap
5. Review the quote and click Execute Swap
6. Confirm the transaction in your wallet

## Supported Tokens

| Token | Mainnet | Testnet |
|-------|---------|---------|
| MNT   | Yes     | Yes     |
| WMNT  | Yes     | Yes     |
| USDT  | Yes     | Yes     |
| USDC  | Yes     | No      |
| WETH  | Yes     | No      |
| mETH  | Yes     | No      |

## Project Structure

```
src/
├── app/
│   ├── api/swap/route.ts   # Quote and swap API endpoints
│   ├── page.tsx            # Main swap interface
│   └── layout.tsx          # App layout
├── components/
│   ├── swap-form.tsx       # Swap form with quote display
│   └── transaction-result.tsx
├── lib/
│   ├── tokens.ts           # Token addresses and decimals
│   └── utils.ts
└── types/
```

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run linter
```

## Adding More Protocols

The Mantle Agent Kit supports additional protocols and features. To extend this demo:

1. Read the [Agent Kit Documentation](https://mantle-devkit.vercel.app/docs-demo)
2. Import the relevant methods from `mantle-agent-kit-sdk`
3. Add the protocol to the swap route handler
4. Update the UI to include the new option

## Resources

- [Mantle Agent Kit Docs](https://mantle-devkit.vercel.app/docs-demo)
- [Mantle Network](https://mantle.xyz)
- [Agni Finance](https://agni.finance)
- [Merchant Moe](https://merchantmoe.com)
- [OpenOcean](https://openocean.finance)

## License

MIT
