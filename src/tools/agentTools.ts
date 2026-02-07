import { z } from "zod";
import { getNetworkConfig } from "../config/networks.js";
import { StellarClient } from "../core/stellarClient.js";
import {
  SoroSwapClient,
  TESTNET_ASSETS,
  type QuoteResponse,
  type Asset,
} from "../defi/index.js";

/** Resolve "XLM" | "AUSDC" | "USDC" | contractId (C...) to Asset for testnet/mainnet. */
function resolveAssetSymbol(symbol: string, network: string): Asset {
  const s = symbol.trim().toUpperCase();
  
  if (network === "mainnet") {
    if (s === "XLM") return { contractId: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA" }; // Native XLM SAC on mainnet
    if (s === "USDC") return { contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75" }; // USDC SAC on mainnet
    if (s.startsWith("C") && s.length === 56) return { contractId: symbol.trim() };
    throw new Error(
      `Unknown mainnet asset "${symbol}". Use XLM, USDC, or a Soroban contract ID (C...).`
    );
  }
  
  // Testnet assets
  if (s === "XLM") return { contractId: TESTNET_ASSETS.XLM };
  if (s === "AUSDC" || s === "USDC") return { contractId: TESTNET_ASSETS.USDC };
  if (s.startsWith("C") && symbol.length === 56) return { contractId: symbol.trim() };
  throw new Error(
    `Unknown testnet asset "${symbol}". Use XLM, AUSDC, or a Soroban contract ID (C...).`
  );
}

/** Convert human amount to raw units (7 decimals for XLM, 6 for USDC/AUSDC on testnet). */
function toRawAmount(amount: string, assetSymbol: string): string {
  // Extract just the number part, removing any asset symbols
  const a = amount.trim().replace(/\s*(XLM|USDC|AUSDC)$/i, '');
  if (!/^\d+(\.\d+)?$/.test(a)) return a;
  const upper = assetSymbol.trim().toUpperCase();
  const decimals = upper === "XLM" ? 7 : upper === "USDC" || upper === "AUSDC" ? 6 : 7;
  const num = Number(a);
  if (!Number.isFinite(num) || num < 0) return a;
  const raw = Math.floor(num * 10 ** decimals);
  return String(raw);
}

export const tools = [
  {
    name: "check_balance",
    description: "Get token balances for a Stellar address",
    parameters: z.object({
      address: z.string().describe("Stellar address"),
      network: z.enum(["testnet", "mainnet"]).optional().default("mainnet"),
    }),
    execute: async ({
      address,
      network = "mainnet",
    }: {
      address: string;
      network?: "testnet" | "mainnet";
    }) => {
      const net = network ?? "mainnet";
      
      // Pre-validate address
      if (!address || address.length !== 56 || !address.startsWith('G')) {
        throw new Error(`Invalid Stellar address. Must be 56 characters starting with G.`);
      }
      
      const config = getNetworkConfig(net);
      const client = new StellarClient(config);
      const balances = await client.getBalance(address);
      return { balances };
    },
  },
  {
    name: "swap_asset",
    description: "Swap tokens via SoroSwap. Use XLM and USDC on mainnet.",
    parameters: z.object({
      fromAsset: z.string().describe("Asset to swap from (XLM or USDC)"),
      toAsset: z.string().describe("Asset to swap to (XLM or USDC)"),
      amount: z.string().describe("Amount to swap (number only)"),
      address: z.string().describe("Stellar address"),
      network: z.enum(["testnet", "mainnet"]).default("mainnet"),
      privateKey: z.string().optional().describe("56-character secret key starting with S"),
    }),
    execute: async ({
      fromAsset,
      toAsset,
      amount,
      address,
      network,
      privateKey,
    }: {
      fromAsset: string;
      toAsset: string;
      amount: string;
      address: string;
      network: "testnet" | "mainnet";
      privateKey?: string;
    }) => {
      
      // Pre-validate address
      if (!address || address.length !== 56 || !address.startsWith('G')) {
        throw new Error(`Invalid Stellar address. Must be 56 characters starting with G.`);
      }

      // Pre-validate private key if provided
      if (privateKey && (privateKey.length !== 56 || !privateKey.startsWith('S'))) {
        throw new Error(`Invalid private key. Must be exactly 56 characters starting with S. Got ${privateKey?.length || 0} characters. Please provide the complete private key.`);
      }
      
      const config = getNetworkConfig(network);
      const soroSwapClient = new SoroSwapClient(config);


      const from = resolveAssetSymbol(fromAsset.trim(), network);
      const to = resolveAssetSymbol(toAsset.trim(), network);
      const rawAmount = toRawAmount(amount, fromAsset.trim());

      let quote: QuoteResponse;
      try {
        // For quotes, don't pass sourceAddress since it's not required and causes validation issues
        // Only pass sourceAddress when actually executing swaps
        quote = await soroSwapClient.getQuote(from, to, rawAmount);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("invalid checksum") || msg.includes("invalid encoded")) {
          throw new Error(
            "Swap quote failed: invalid key or contract format. Use testnet, XLM/AUSDC, no secret key for quote only."
          );
        }
        if (
          msg.includes("SOROSWAP_API_KEY") ||
          msg.includes("Quote via contract") ||
          msg.includes("MismatchingParameterLen")
        ) {
          throw new Error(
            "Swap quotes need SOROSWAP_API_KEY. Get an API key from the SoroSwap console and set it to get XLM/AUSDC quotes."
          );
        }
        if (msg.includes("Invalid Stellar address") || msg.includes("No path found")) {
          // Provide a helpful message for testnet liquidity issues
          throw new Error(
            `No liquidity available for ${fromAsset} → ${toAsset} on testnet. This is a demo environment - in production, try different pairs or check SoroSwap for available liquidity pools.`
          );
        }
        throw err;
      }

      if (!privateKey) {
        return {
          success: false as const,
          quote,
          message:
            "No privateKey provided. Set privateKey to execute the swap (DEMO ONLY).",
        };
      }


      let result: { hash: string; status: string };
      try {
        result = await soroSwapClient.executeSwap(privateKey, quote, network);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("invalid checksum") || msg.includes("invalid encoded")) {
          throw new Error(
            "Swap execution failed: use secret key (S...) not address (G...), or omit for quote only."
          );
        }
        throw err;
      }


      return {
        success: true as const,
        txHash: result.hash,
        status: result.status,
        quote,
      };
    },
  },
];
