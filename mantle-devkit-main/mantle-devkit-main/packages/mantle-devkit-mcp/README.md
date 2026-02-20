# Mantle MCP Server

MCP (Model Context Protocol) server for Mantle Network. Provides SDK documentation, DeFi protocols, and Mantle ecosystem context to Claude and other AI assistants.

## Installation

```bash
npm install -g mantle-mcp-server
```

Or install from source:

```bash
git clone https://github.com/Debanjannnn/mantle-devkit
cd mantle-devkit/packages/mantle-devkit-mcp
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/.config/claude/claude_desktop_config.json` on Linux/Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "mantle": {
      "command": "npx",
      "args": ["mantle-mcp-server"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "mantle": {
      "command": "mantle-mcp-server"
    }
  }
}
```

## Available Resources

The MCP server provides documentation and context through these resource URIs:

### Agent Kit SDK
- `mantle://agent-kit/overview` - SDK overview and quick start
- `mantle://agent-kit/dex` - DEX operations and swap functions
- `mantle://agent-kit/lending` - Lendle lending protocol
- `mantle://agent-kit/cross-chain` - Cross-chain operations via Squid
- `mantle://agent-kit/meth` - mETH liquid staking
- `mantle://agent-kit/configuration` - SDK configuration

### x402 Protocol
- `mantle://x402/overview` - Protocol overview
- `mantle://x402/server` - Server integration
- `mantle://x402/client` - Client integration
- `mantle://x402/payment-flow` - Payment flow details

### Mantle Network
- `mantle://network/overview` - Network overview and chain details
- `mantle://network/mnt-token` - MNT token details and tokenomics
- `mantle://network/bridge` - Bridge and cross-chain transfers
- `mantle://network/contracts` - DeFi protocol contract addresses
- `mantle://network/tokens` - Common tokens on Mantle
- `mantle://network/ecosystem` - Ecosystem protocols and dApps
- `mantle://network/development` - Development resources and setup
- `mantle://network/gas` - Gas fees and optimization
- `mantle://network/security` - Security considerations
- `mantle://network/oracles` - Oracle services (Pyth, Chainlink, etc.)

### Code Examples
- `example://swap` - Token swap examples
- `example://lending-supply` - Lendle supply example
- `example://lending-borrow` - Lendle borrow example
- `example://x402-server` - x402 server example
- `example://x402-client` - x402 client example
- `example://cross-chain` - Cross-chain swap example
- `example://full-agent` - Complete agent setup

## Available Tools

### search_mantle_docs
Search across all Mantle DevKit documentation.

```
Input: { "query": "swap" }
```

### get_contract_address
Get contract address for a specific protocol on Mantle.

```
Input: { "protocol": "agni", "contract": "router" }
Output: "agni router: 0x319B69888b0d11cEC22caA5034e25FfFBDc88421"
```

Supported protocols:
- `lendle` - Lending protocol
- `agni` - Agni Finance DEX
- `merchant-moe` - Merchant Moe DEX
- `uniswap` - Uniswap V3
- `meth` - mETH Protocol

### get_code_example
Get code example for a specific operation.

```
Input: { "operation": "swap" }
```

Available operations: `swap`, `supply`, `borrow`, `x402-server`, `x402-client`, `cross-chain`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Start server
npm start
```

## Resources

- [Mantle DevKit Dashboard](https://mantle-devkit.vercel.app)
- [Mantle Agent Kit SDK](https://www.npmjs.com/package/mantle-agent-kit-sdk)
- [x402 DevKit](https://www.npmjs.com/package/x402-devkit)
- [Mantle Network Docs](https://docs.mantle.xyz/)

## License

MIT
