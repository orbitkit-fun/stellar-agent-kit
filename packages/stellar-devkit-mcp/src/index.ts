#!/usr/bin/env node

/**
 * Stellar DevKit MCP Server – tools and resources for Stellar development.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { STELLAR_RESOURCES } from "./resources/stellar.js";
import {
  getNetworkConfig,
  createDexClient,
  MAINNET_ASSETS,
  type DexAsset,
} from "stellar-agent-kit";

const server = new Server(
  { name: "stellar-devkit-mcp", version: "1.0.0" },
  { capabilities: { resources: {}, tools: {} } }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: Object.entries(STELLAR_RESOURCES).map(([uri, info]) => ({
    uri,
    name: uri.replace("stellar://", ""),
    description: info.description,
    mimeType: "text/markdown",
  })),
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
          network: { type: "string", enum: ["mainnet"], description: "Network (mainnet only)" },
        },
        required: ["protocol"],
      },
    },
    {
      name: "get_sdk_snippet",
      description: "Use this tool when the user asks for Stellar DevKit code, SDK snippet, or example (swap, quote, x402 server/client). Returns copy-paste code for stellar-agent-kit or x402-stellar-sdk. Call with operation: 'swap' | 'quote' | 'x402-server' | 'x402-client'.",
      inputSchema: {
        type: "object",
        properties: {
          operation: { type: "string", enum: ["swap", "quote", "x402-server", "x402-client"], description: "Which snippet to return" },
        },
        required: ["operation"],
      },
    },
    {
      name: "get_quote",
      description: "Get a live swap quote for Stellar (XLM ↔ USDC on mainnet). Call when the user asks for a quote, expected output, or swap rate. Requires SOROSWAP_API_KEY in the environment where MCP runs.",
      inputSchema: {
        type: "object",
        properties: {
          fromAsset: { type: "string", enum: ["XLM", "USDC"], description: "Asset to swap from" },
          toAsset: { type: "string", enum: ["XLM", "USDC"], description: "Asset to swap to" },
          amount: { type: "string", description: "Amount in human-readable form (e.g. 1 or 10.5)" },
        },
        required: ["fromAsset", "toAsset", "amount"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  if (name === "get_stellar_contract") {
    const protocol = (args?.protocol as string)?.toLowerCase() || "";
    const network = ((args?.network as string) || "mainnet").toLowerCase();
    const ids = protocol === "soroswap" 
      ? { testnet: "CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD", mainnet: "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH" }
      : null;
    const text = ids ? `${protocol} ${network}: ${ids[network as "testnet"|"mainnet"]}` : `Unknown protocol: ${protocol}`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "get_sdk_snippet") {
    const op = (args?.operation as string)?.toLowerCase() || "";
    const snippets: Record<string, string> = {
      swap: "const agent = new StellarAgentKit(secretKey, 'mainnet'); await agent.initialize(); const quote = await agent.dexGetQuote(fromAsset, toAsset, amount); await agent.dexSwap(quote);",
      quote: "await agent.dexGetQuote({ contractId: '...' }, { contractId: '...' }, amount);",
      "x402-server": "app.use('/api/premium', x402({ price: '1', assetCode: 'XLM', network: 'mainnet', destination: 'G...' }));",
      "x402-client": "await x402Fetch(url, init, { payWithStellar: async (req) => { /* Freighter payment */ return { transactionHash: txHash }; } });",
    };
    const text = snippets[op] || `Unknown operation: ${op}. Use: ${Object.keys(snippets).join(", ")}`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "get_quote") {
    const fromAsset = (args?.fromAsset as string)?.toUpperCase() || "XLM";
    const toAsset = (args?.toAsset as string)?.toUpperCase() || "USDC";
    const amountStr = (args?.amount as string)?.trim() || "0";
    const apiKey = process.env.SOROSWAP_API_KEY;
    if (!apiKey) {
      const msg =
        "Live quotes require SOROSWAP_API_KEY in the environment where the MCP server runs. " +
        "Use get_sdk_snippet with operation 'quote' for code to get a quote in your app.";
      return { content: [{ type: "text", text: msg }] };
    }
    const fromContract = fromAsset === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const toContract = toAsset === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const from: DexAsset = { contractId: fromContract.contractId };
    const to: DexAsset = { contractId: toContract.contractId };
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
      const text =
        `Quote: ${amountStr} ${fromAsset} → ${expectedOutHuman} ${toAsset} (min out: ${minOutHuman} ${toAsset}). ` +
        `Route: ${quote.route ?? "SoroSwap aggregator"}.`;
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
