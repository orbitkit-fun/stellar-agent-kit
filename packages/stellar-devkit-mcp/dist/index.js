#!/usr/bin/env node

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// src/resources/stellar.ts
var STELLAR_RESOURCES = {
  "stellar://networks": {
    description: "Stellar network config (Horizon, Soroban RPC)",
    content: `# Stellar Networks

| Network | Horizon | Soroban RPC |
|---------|---------|-------------|
| mainnet | https://horizon.stellar.org | https://soroban-rpc.mainnet.stellar.gateway.fm |
`
  },
  "stellar://contracts": {
    description: "Protocol contract IDs (SoroSwap aggregator)",
    content: `# Contract Addresses (Soroban)

- SoroSwap Aggregator mainnet: CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH
`
  },
  "stellar://assets": {
    description: "Mainnet asset identifiers",
    content: `# Token / Asset Addresses (Mainnet)

XLM: CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA
USDC: CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
`
  }
};

// src/index.ts
import {
  getNetworkConfig,
  createDexClient,
  MAINNET_ASSETS
} from "stellar-agent-kit";
var server = new Server(
  { name: "stellar-devkit-mcp", version: "1.0.0" },
  { capabilities: { resources: {}, tools: {} } }
);
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: Object.entries(STELLAR_RESOURCES).map(([uri, info]) => ({
    uri,
    name: uri.replace("stellar://", ""),
    description: info.description,
    mimeType: "text/markdown"
  }))
}));
server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const r = STELLAR_RESOURCES[req.params.uri];
  if (!r) throw new Error(`Resource not found: ${req.params.uri}`);
  return { contents: [{ uri: req.params.uri, mimeType: "text/markdown", text: r.content }] };
});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_stellar_contract",
      description: "Use this tool when the user asks for a Stellar/Soroban contract ID or protocol address (e.g. SoroSwap mainnet). Returns the Soroban contract ID. Call with protocol (e.g. 'soroswap') and optional network (mainnet only).",
      inputSchema: {
        type: "object",
        properties: {
          protocol: { type: "string", description: "Protocol name, e.g. soroswap" },
          network: { type: "string", enum: ["mainnet"], description: "Network (mainnet only)" }
        },
        required: ["protocol"]
      }
    },
    {
      name: "get_sdk_snippet",
      description: "Returns copy-paste code for stellar-agent-kit or x402-stellar-sdk. Call with operation: swap, quote, x402-server, x402-client, get-balances, send-payment, create-account, path-payment.",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["swap", "quote", "x402-server", "x402-client", "get-balances", "send-payment", "create-account", "path-payment"],
            description: "Which snippet to return"
          }
        },
        required: ["operation"]
      }
    },
    {
      name: "list_devkit_methods",
      description: "List Stellar DevKit public APIs: stellar-agent-kit (StellarAgentKit methods) and x402-stellar-sdk (server/client). Use when the user asks what the devkit can do or what methods are available.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_quote",
      description: "Get a live swap quote for Stellar (XLM \u2194 USDC on mainnet). Call when the user asks for a quote, expected output, or swap rate. Requires SOROSWAP_API_KEY in the environment where MCP runs.",
      inputSchema: {
        type: "object",
        properties: {
          fromAsset: { type: "string", enum: ["XLM", "USDC"], description: "Asset to swap from" },
          toAsset: { type: "string", enum: ["XLM", "USDC"], description: "Asset to swap to" },
          amount: { type: "string", description: "Amount in human-readable form (e.g. 1 or 10.5)" }
        },
        required: ["fromAsset", "toAsset", "amount"]
      }
    }
  ]
}));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  if (name === "get_stellar_contract") {
    const protocol = args?.protocol?.toLowerCase() || "";
    const network = (args?.network || "mainnet").toLowerCase();
    const ids = protocol === "soroswap" ? { testnet: "CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD", mainnet: "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH" } : null;
    const text = ids ? `${protocol} ${network}: ${ids[network]}` : `Unknown protocol: ${protocol}`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "get_sdk_snippet") {
    const op = args?.operation?.toLowerCase() || "";
    const snippets = {
      swap: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";
const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);`,
      quote: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";
const agent = new StellarAgentKit(secretKey, "mainnet");
await agent.initialize();
const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  amount
);`,
      "x402-server": `import { x402 } from "x402-stellar-sdk/server";
const options = { price: "1", assetCode: "XLM", network: "testnet" as const, destination: process.env.X402_DESTINATION! };
app.use("/api/premium", x402(options));
app.get("/api/premium", (req, res) => res.json({ data: "Premium content" }));`,
      "x402-client": `import { x402Fetch } from "x402-stellar-sdk/client";
const res = await x402Fetch(url, undefined, {
  payWithStellar: async (req) => {
    const txHash = await submitPaymentWithWallet(req);
    return txHash ? { transactionHash: txHash } : null;
  },
});`,
      "get-balances": `const balances = await agent.getBalances();
// or for another account: await agent.getBalances("G...");`,
      "send-payment": `await agent.sendPayment("G...", "10");
// custom asset: await agent.sendPayment("G...", "5", "USDC", "G...");`,
      "create-account": `await agent.createAccount("G...", "1");`,
      "path-payment": `await agent.pathPayment(
  { assetCode: "XLM" }, "10", "G...",
  { assetCode: "USDC", issuer: "G..." }, "5", []
);`
    };
    const text = snippets[op] || `Unknown operation: ${op}. Use: ${Object.keys(snippets).join(", ")}`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "list_devkit_methods") {
    const text = `# Stellar DevKit \u2013 public APIs

## stellar-agent-kit (StellarAgentKit)
- initialize() \u2013 call once after construction
- getBalances(accountId?) \u2013 native + trustline balances
- sendPayment(to, amount, assetCode?, assetIssuer?)
- createAccount(destination, startingBalance)
- pathPayment(sendAsset, sendMax, destination, destAsset, destAmount, path?)
- dexGetQuote(fromAsset, toAsset, amount)
- dexSwap(quote)
- dexSwapExactIn(fromAsset, toAsset, amount)
- getPrice(asset)
- lendingSupply(args), lendingBorrow(args)

## x402-stellar-sdk
- Server: x402(options), x402Hono(options), withX402(headers, options), processPaymentMiddleware, verifyPaymentOnChain
- Client: x402Fetch(input, init?, { payWithStellar })`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "get_quote") {
    const fromAsset = args?.fromAsset?.toUpperCase() || "XLM";
    const toAsset = args?.toAsset?.toUpperCase() || "USDC";
    const amountStr = args?.amount?.trim() || "0";
    const apiKey = process.env.SOROSWAP_API_KEY;
    if (!apiKey) {
      const msg = "Live quotes require SOROSWAP_API_KEY in the environment where the MCP server runs. Use get_sdk_snippet with operation 'quote' for code to get a quote in your app.";
      return { content: [{ type: "text", text: msg }] };
    }
    const fromContract = fromAsset === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const toContract = toAsset === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const from = { contractId: fromContract.contractId };
    const to = { contractId: toContract.contractId };
    const decimals = fromAsset === "XLM" ? 7 : 7;
    const num = parseFloat(amountStr);
    if (!Number.isFinite(num) || num <= 0) {
      return { content: [{ type: "text", text: `Invalid amount: ${amountStr}. Use a positive number.` }] };
    }
    const rawAmount = String(Math.floor(num * 10 ** decimals));
    try {
      const config = getNetworkConfig("mainnet");
      const client = createDexClient(config, apiKey);
      const quote = await client.getQuote(from, to, rawAmount);
      const outDecimals = toAsset === "XLM" ? 7 : 7;
      const expectedOutHuman = (parseInt(quote.expectedOut, 10) / 10 ** outDecimals).toFixed(6);
      const minOutHuman = (parseInt(quote.minOut, 10) / 10 ** outDecimals).toFixed(6);
      const text = `Quote: ${amountStr} ${fromAsset} \u2192 ${expectedOutHuman} ${toAsset} (min out: ${minOutHuman} ${toAsset}). Route: ${quote.route ?? "SoroSwap aggregator"}.`;
      return { content: [{ type: "text", text }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Quote failed: ${message}` }] };
    }
  }
  throw new Error(`Unknown tool: ${name}`);
});
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stellar DevKit MCP running on stdio");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
