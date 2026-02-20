#!/usr/bin/env node
/**
 * Mantle DevKit MCP Server
 *
 * Provides SDK documentation and Mantle network context to Claude
 * via the Model Context Protocol (MCP).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { AGENT_KIT_RESOURCES } from "./resources/agent-kit.js";
import { X402_RESOURCES } from "./resources/x402.js";
import { MANTLE_RESOURCES } from "./resources/mantle.js";
import { CODE_EXAMPLES } from "./resources/examples.js";
// Combine all resources
const ALL_RESOURCES = {
    ...AGENT_KIT_RESOURCES,
    ...X402_RESOURCES,
    ...MANTLE_RESOURCES,
    ...CODE_EXAMPLES,
};
// Create server instance
const server = new Server({
    name: "mantle-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: Object.entries(ALL_RESOURCES).map(([uri, info]) => ({
            uri,
            name: uri.split("://")[1] || uri,
            description: info.description,
            mimeType: info.mimeType || "text/markdown",
        })),
    };
});
// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const resource = ALL_RESOURCES[uri];
    if (!resource) {
        throw new Error(`Resource not found: ${uri}`);
    }
    return {
        contents: [
            {
                uri,
                mimeType: resource.mimeType || "text/markdown",
                text: resource.content,
            },
        ],
    };
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_mantle_docs",
                description: "Search across Mantle DevKit documentation for specific topics",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query (e.g., 'swap', 'lending', 'x402', 'cross-chain')",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_contract_address",
                description: "Get contract address for a specific protocol on Mantle",
                inputSchema: {
                    type: "object",
                    properties: {
                        protocol: {
                            type: "string",
                            description: "Protocol name (e.g., 'lendle', 'agni', 'merchant-moe', 'uniswap')",
                        },
                        contract: {
                            type: "string",
                            description: "Contract type (e.g., 'router', 'pool', 'factory')",
                        },
                    },
                    required: ["protocol"],
                },
            },
            {
                name: "get_code_example",
                description: "Get code example for a specific operation",
                inputSchema: {
                    type: "object",
                    properties: {
                        operation: {
                            type: "string",
                            description: "Operation type (e.g., 'swap', 'supply', 'borrow', 'x402-server', 'x402-client')",
                        },
                    },
                    required: ["operation"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "search_mantle_docs") {
        const query = args?.query?.toLowerCase() || "";
        const results = [];
        for (const [uri, resource] of Object.entries(ALL_RESOURCES)) {
            if (uri.toLowerCase().includes(query) ||
                resource.content.toLowerCase().includes(query) ||
                resource.description.toLowerCase().includes(query)) {
                results.push(`## ${uri}\n${resource.description}\n`);
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: results.length > 0
                        ? `Found ${results.length} matching resources:\n\n${results.join("\n")}`
                        : `No results found for "${query}"`,
                },
            ],
        };
    }
    if (name === "get_contract_address") {
        const protocol = args?.protocol?.toLowerCase() || "";
        const contract = args?.contract?.toLowerCase() || "";
        const contracts = {
            lendle: {
                pool: "0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3",
                lendingpool: "0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3",
                dataprovider: "0xD0E0b5e99c8a36f4c5234cd1E90CFc5C2Bb58A69",
            },
            agni: {
                router: "0x319B69888b0d11cEC22caA5034e25FfFBDc88421",
                swaprouter: "0x319B69888b0d11cEC22caA5034e25FfFBDc88421",
                factory: "0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035",
                positionmanager: "0x9C9e335A3BC0EF6F66F44390c383D0bB7a0A34f0",
            },
            "merchant-moe": {
                router: "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a",
                lbrouter: "0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a",
                factory: "0xa6630671775c4EA2743840F9A5016dCf2A104054",
                quoter: "0xFa1ec885c522Ee2c06aFCfBC66E88a88ca09EEED",
            },
            uniswap: {
                router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
                swaprouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
                quoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
            },
            meth: {
                token: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
            },
        };
        const protocolContracts = contracts[protocol];
        if (!protocolContracts) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Unknown protocol: ${protocol}. Available: ${Object.keys(contracts).join(", ")}`,
                    },
                ],
            };
        }
        if (contract) {
            const address = protocolContracts[contract];
            if (address) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `${protocol} ${contract}: ${address}`,
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Unknown contract: ${contract}. Available for ${protocol}: ${Object.keys(protocolContracts).join(", ")}`,
                    },
                ],
            };
        }
        // Return all contracts for protocol
        const result = Object.entries(protocolContracts)
            .map(([name, addr]) => `- ${name}: ${addr}`)
            .join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: `${protocol} contracts:\n${result}`,
                },
            ],
        };
    }
    if (name === "get_code_example") {
        const operation = args?.operation?.toLowerCase() || "";
        const examples = {
            swap: CODE_EXAMPLES["example://swap"]?.content || "No swap example available",
            supply: CODE_EXAMPLES["example://lending-supply"]?.content || "No supply example available",
            borrow: CODE_EXAMPLES["example://lending-borrow"]?.content || "No borrow example available",
            "x402-server": CODE_EXAMPLES["example://x402-server"]?.content || "No x402 server example available",
            "x402-client": CODE_EXAMPLES["example://x402-client"]?.content || "No x402 client example available",
            "cross-chain": CODE_EXAMPLES["example://cross-chain"]?.content || "No cross-chain example available",
        };
        const example = examples[operation];
        if (example) {
            return {
                content: [{ type: "text", text: example }],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Unknown operation: ${operation}. Available: ${Object.keys(examples).join(", ")}`,
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${name}`);
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Mantle MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map