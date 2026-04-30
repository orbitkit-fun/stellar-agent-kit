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
      description: "Use this tool when the user asks for a Stellar/Soroban contract ID or protocol address. Returns the contract ID or SDK link. Call with protocol: soroswap, blend, fxdao, reflector, allbridge; optional network (mainnet default).",
      inputSchema: {
        type: "object",
        properties: {
          protocol: { type: "string", description: "Protocol: soroswap, blend, fxdao, reflector, allbridge" },
          network: { type: "string", enum: ["mainnet", "testnet"], description: "Network (mainnet default)" },
        },
        required: ["protocol"],
      },
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
            description: "Which snippet to return",
          },
        },
        required: ["operation"],
      },
    },
    {
      name: "list_devkit_methods",
      description: "List Stellar DevKit public APIs: stellar-agent-kit (StellarAgentKit methods) and x402-stellar-sdk (server/client). Use when the user asks what the devkit can do or what methods are available.",
      inputSchema: { type: "object", properties: {} },
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
    {
      name: "get_account_balance",
      description:
        "Get the on-chain balance for a Stellar account. Returns native XLM balance plus " +
        "all trustline (credit asset) balances with issuer and limit. Use when the user asks " +
        "'what's the balance of G...', 'does account X hold USDC', or wants to inspect holdings " +
        "before a swap or send. Reads directly from Horizon — no API key or secret required.",
      inputSchema: {
        type: "object",
        properties: {
          accountId: {
            type: "string",
            description: "Stellar public key (starts with G, 56 chars)",
          },
          network: {
            type: "string",
            enum: ["mainnet", "testnet"],
            description: "Network to query (default: mainnet)",
          },
          assetCode: {
            type: "string",
            description:
              "Optional — filter to a single asset code (e.g. 'XLM', 'USDC'). " +
              "If omitted, returns all balances.",
          },
        },
        required: ["accountId"],
      },
    },
    {
      name: "execute_swap",
      description:
        "Execute an actual token swap on Stellar mainnet via SoroSwap. " +
        "IMPORTANT: Always call get_quote first and confirm with the user before executing. " +
        "Signs and submits the transaction using SECRET_KEY from the MCP environment. " +
        "Requires both SOROSWAP_API_KEY and SECRET_KEY environment variables. " +
        "Supported assets: XLM, USDC.",
      inputSchema: {
        type: "object",
        properties: {
          fromAsset: {
            type: "string",
            enum: ["XLM", "USDC"],
            description: "Asset to swap from",
          },
          toAsset: {
            type: "string",
            enum: ["XLM", "USDC"],
            description: "Asset to swap to",
          },
          amount: {
            type: "string",
            description: "Amount in human-readable form (e.g. \"10\" or \"0.5\")",
          },
          slippageBps: {
            type: "number",
            description: "Max slippage in basis points (default: 50 = 0.5%)",
          },
        },
        required: ["fromAsset", "toAsset", "amount"],
      },
    },
    {
      name: "get_account_balance",
      description: "Get the balance of a Stellar account including XLM and all token balances. Takes a public key and returns a formatted balance summary.",
      inputSchema: {
        type: "object",
        properties: {
          publicKey: {
            type: "string",
            description: "Stellar public key (G...)",
          },
          network: {
            type: "string",
            enum: ["mainnet", "testnet"],
            description: "Network (mainnet default)",
          },
        },
        required: ["publicKey"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  if (name === "get_stellar_contract") {
    const protocol = (args?.protocol as string)?.toLowerCase() || "";
    const network = ((args?.network as string) || "mainnet").toLowerCase();
    const protocolIds: Record<string, { testnet?: string; mainnet: string } | { mainnet: string; note?: string }> = {
      soroswap: { testnet: "CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD", mainnet: "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH" },
      blend: { mainnet: "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS" },
      fxdao: { mainnet: "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB", note: "Vaults; see FXDAO_MAINNET in stellar-agent-kit for Locking Pool, USDx, etc." },
      reflector: { mainnet: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M", note: "dex feed; REFLECTOR_ORACLE in stellar-agent-kit has cexDex, fiat" },
      allbridge: { mainnet: "https://docs-core.allbridge.io/sdk/guides/stellar", note: "No single contract; use Allbridge Core SDK" },
    };
    const entry = protocolIds[protocol];
    const n = network as "testnet" | "mainnet";
    let text: string;
    if (!entry) text = `Unknown protocol: ${protocol}. Supported: ${Object.keys(protocolIds).join(", ")}`;
    else if ("note" in entry) text = `${protocol} mainnet: ${entry.mainnet}. ${entry.note ?? ""}`;
    else {
      const e = entry as { mainnet: string; testnet?: string };
      text = e[n] ? `${protocol} ${network}: ${e[n]}` : `${protocol} ${network}: not available (mainnet only: ${e.mainnet})`;
    }
    return { content: [{ type: "text", text }] };
  }
  if (name === "get_sdk_snippet") {
    const op = (args?.operation as string)?.toLowerCase() || "";
    const snippets: Record<string, string> = {
     // this is a code snippet the MCP serves to developers. They will copy-paste it directly into their projects If it shows process.env.SECRET_KEY!, they inherit the bad pattern their app will crash with a **cryptic** Stellar SDK error instead of a clear message when the env var is missing
      swap: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";
const secretKey = process.env.SECRET_KEY;
if (!secretKey) throw new Error("SECRET_KEY is required.");
const agent = new StellarAgentKit(secretKey, "mainnet");
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
// same reason as "swap" above it's a copy-paste snippet
      "x402-server": `import { x402 } from "x402-stellar-sdk/server";
const destination = process.env.X402_DESTINATION;
if (!destination) throw new Error("X402_DESTINATION is required.");
const options = { price: "1", assetCode: "XLM", network: "testnet" as const, destination };
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
);`,
    };
    const text = snippets[op] || `Unknown operation: ${op}. Use: ${Object.keys(snippets).join(", ")}`;
    return { content: [{ type: "text", text }] };
  }
  if (name === "list_devkit_methods") {
    const text = `# Stellar DevKit – public APIs

## MCP tools (this server)
- get_account_balance(accountId, network?, assetCode?) – on-chain balance via Horizon
- get_quote, execute_swap, get_stellar_contract, get_sdk_snippet, list_devkit_methods

## stellar-agent-kit (StellarAgentKit)
- initialize() – call once after construction
- getBalances(accountId?) – native + trustline balances
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
- Client: x402Fetch(input, init?, { payWithStellar })

## stellar-agent-kit config
- MAINNET_ASSETS (XLM, USDC), SOROSWAP_AGGREGATOR, BLEND_POOLS_MAINNET, REFLECTOR_ORACLE
- FXDAO_MAINNET (vaults, lockingPool, usdx, eurx, gbpx, fxg, oracle), ALLBRIDGE_CORE_STELLAR_DOCS (SDK link)`;
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
  if (name === "get_account_balance") {
    const accountId = ((args?.accountId as string) ?? "").trim();
    const network = (((args?.network as string) ?? "mainnet").toLowerCase()) as "mainnet" | "testnet";
    const filterAssetCode = ((args?.assetCode as string) ?? "").trim().toUpperCase();

    if (!/^G[A-Z2-7]{55}$/.test(accountId)) {
      return {
        content: [{
          type: "text",
          text:
            `Invalid accountId: "${accountId}". Must be a Stellar public key ` +
            `(starts with G, 56 chars, base32).`,
        }],
      };
    }

    if (network !== "mainnet" && network !== "testnet") {
      return {
        content: [{ type: "text", text: `Invalid network: ${network}. Use "mainnet" or "testnet".` }],
      };
    }

    const { horizonUrl } = getNetworkConfig(network);
    const url = `${horizonUrl}/accounts/${accountId}`;

    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 404) {
        return {
          content: [{
            type: "text",
            text:
              `Account ${accountId} does not exist on ${network}. ` +
              `It must be funded with at least the base reserve (currently 1 XLM) before it appears on-chain.`,
          }],
        };
      }
      if (!res.ok) {
        const body = await res.text();
        return {
          content: [{ type: "text", text: `Horizon request failed (${res.status}): ${body.slice(0, 300)}` }],
        };
      }

      const data = (await res.json()) as {
        balances: Array<{
          balance: string;
          asset_type: string;
          asset_code?: string;
          asset_issuer?: string;
          limit?: string;
        }>;
      };

      let balances = data.balances ?? [];
      if (filterAssetCode) {
        balances = balances.filter((b) => {
          const code = b.asset_type === "native" ? "XLM" : (b.asset_code ?? "").toUpperCase();
          return code === filterAssetCode;
        });
      }

      if (balances.length === 0) {
        const note = filterAssetCode
          ? ` No ${filterAssetCode} balance found on this account.`
          : "";
        return {
          content: [{ type: "text", text: `Account ${accountId} on ${network}:${note}` }],
        };
      }

      const lines = balances.map((b) => {
        if (b.asset_type === "native") {
          return `  • XLM (native): ${b.balance}`;
        }
        const code = b.asset_code ?? "?";
        const issuer = b.asset_issuer ? `${b.asset_issuer.slice(0, 4)}…${b.asset_issuer.slice(-4)}` : "?";
        const limit = b.limit ? ` / limit ${b.limit}` : "";
        return `  • ${code} (issuer ${issuer}): ${b.balance}${limit}`;
      });

      const header =
        `Balance for ${accountId} on ${network}` +
        (filterAssetCode ? ` (filter: ${filterAssetCode})` : "") +
        ":";
      return {
        content: [{ type: "text", text: [header, ...lines].join("\n") }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Failed to fetch balance from ${horizonUrl}: ${message}` }],
      };
    }
  }
  if (name === "execute_swap") {
    const apiKey = process.env.SOROSWAP_API_KEY;
    const secretKey = process.env.SECRET_KEY;

    if (!apiKey) {
      return {
        content: [{
          type: "text",
          text:
            "execute_swap requires SOROSWAP_API_KEY in the MCP server environment. " +
            "Add it to your MCP config and restart the server.",
        }],
      };
    }

    if (!secretKey) {
      return {
        content: [{
          type: "text",
          text:
            "execute_swap requires SECRET_KEY (Stellar secret key S...) in the MCP server environment. " +
            "Add it to your MCP config and restart the server.",
        }],
      };
    }

    const fromAsset = ((args?.fromAsset as string) ?? "XLM").toUpperCase();
    const toAsset   = ((args?.toAsset   as string) ?? "USDC").toUpperCase();
    const amountStr = ((args?.amount    as string) ?? "0").trim();
    const slippageBps = typeof args?.slippageBps === "number" ? (args.slippageBps as number) : 50;

    const num = parseFloat(amountStr);
    if (!Number.isFinite(num) || num <= 0) {
      return {
        content: [{ type: "text", text: `Invalid amount: ${amountStr}. Use a positive number like "10" or "0.5".` }],
      };
    }

    if (fromAsset === toAsset) {
      return {
        content: [{ type: "text", text: "fromAsset and toAsset must be different." }],
      };
    }

    const decimals = 7;
    const rawAmount = String(Math.floor(num * 10 ** decimals));
    const fromContract = fromAsset === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const toContract   = toAsset   === "XLM" ? MAINNET_ASSETS.XLM : MAINNET_ASSETS.USDC;
    const from: DexAsset = { contractId: fromContract.contractId };
    const to:   DexAsset = { contractId: toContract.contractId };

    try {
      const config = getNetworkConfig("mainnet");
      const client = createDexClient(config, apiKey);

      const quote = await client.getQuote(from, to, rawAmount);
      const result = await client.executeSwap(secretKey, quote);

      const expectedOutHuman = (parseInt(quote.expectedOut, 10) / 10 ** decimals).toFixed(6);
      const minOutHuman      = (parseInt(quote.minOut,      10) / 10 ** decimals).toFixed(6);

      const text = [
        `✅ Swap executed successfully!`,
        ``,
        `📊 Details:`,
        `  • Sold:      ${amountStr} ${fromAsset}`,
        `  • Received:  ~${expectedOutHuman} ${toAsset}`,
        `  • Min out:   ${minOutHuman} ${toAsset} (slippage: ${slippageBps / 100}%)`,
        ``,
        `🔗 Transaction: https://stellar.expert/explorer/public/tx/${result.hash}`,
        `📋 Status: ${result.status}`,
      ].join("\n");

      return { content: [{ type: "text", text }] };

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      let hint = "";
      if (message.includes("insufficient")) hint = " Check your account balance.";
      else if (message.includes("sendTransaction")) hint = " The network rejected the transaction. Try again.";
      else if (message.includes("build")) hint = " SoroSwap build step failed. Your SOROSWAP_API_KEY may need swap permissions.";

      return {
        content: [{ type: "text", text: `❌ Swap failed: ${message}.${hint}` }],
      };
    }
  }
  if (name === "get_account_balance") {
    const publicKey = (args?.publicKey as string)?.trim();
    const network = ((args?.network as string) || "mainnet").toLowerCase();

    if (!publicKey) {
      return { content: [{ type: "text", text: "Public key is required." }] };
    }

    // Basic validation for Stellar public key format
    if (!publicKey.startsWith("G") || publicKey.length !== 56) {
      return { content: [{ type: "text", text: "Invalid Stellar public key format. Public keys start with 'G' and are 56 characters long." }] };
    }

    try {
      const config = getNetworkConfig(network as "mainnet" | "testnet");
      const horizonUrl = config.horizonUrl;
      
      const response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return { content: [{ type: "text", text: `Account ${publicKey} not found on ${network}.` }] };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const account = await response.json();
      
      // Format balances
      const balances = account.balances.map((balance: any) => {
        if (balance.asset_type === "native") {
          return `XLM: ${parseFloat(balance.balance).toFixed(7)}`;
        } else {
          const assetCode = balance.asset_code || "Unknown";
          const issuer = balance.asset_issuer ? ` (${balance.asset_issuer.substring(0, 8)}...)` : "";
          return `${assetCode}${issuer}: ${parseFloat(balance.balance).toFixed(7)}`;
        }
      });

      const text = [
        `Account Balance Summary`,
        `========================`,
        `Public Key: ${publicKey}`,
        `Network: ${network}`,
        `Sequence: ${account.sequence}`,
        ``,
        `Balances:`,
        ...balances.map((b: string) => `  ${b}`),
        ``,
        `Total Subentries: ${account.subentry_count}`,
        `Last Modified: ${new Date(account.last_modified_time).toLocaleString()}`,
      ].join("\n");

      return { content: [{ type: "text", text }] };

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Failed to fetch account balance: ${message}` }] };
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
