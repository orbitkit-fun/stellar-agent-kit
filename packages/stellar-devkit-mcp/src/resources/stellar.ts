/**
 * Stellar DevKit MCP resources – networks, contracts, asset addresses.
 */

export const STELLAR_RESOURCES: Record<string, { content: string; description: string }> = {
  "stellar://networks": {
    description: "Stellar network config (Horizon, Soroban RPC)",
    content: `# Stellar Networks

| Network | Horizon | Soroban RPC |
|---------|---------|-------------|
| mainnet | https://horizon.stellar.org | https://soroban-rpc.mainnet.stellar.gateway.fm |
`,
  },
  "stellar://contracts": {
    description: "Protocol contract IDs (SoroSwap aggregator)",
    content: `# Contract Addresses (Soroban)

- SoroSwap Aggregator mainnet: CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH
`,
  },
  "stellar://assets": {
    description: "Mainnet asset identifiers",
    content: `# Token / Asset Addresses (Mainnet)

XLM: CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA
USDC: CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
`,
  },
};
