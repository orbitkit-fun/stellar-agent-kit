import { z } from "zod";
import { type QuoteResponse } from "../defi/index.js";
export declare const tools: ({
    name: string;
    description: string;
    parameters: z.ZodObject<{
        address: z.ZodString;
        network: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"mainnet">>>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        network: "mainnet";
    }, {
        address: string;
        network?: "mainnet" | undefined;
    }>;
    execute: ({ address, network, }: {
        address: string;
        network?: "testnet" | "mainnet";
    }) => Promise<{
        balances: import("../core/stellarClient.js").BalanceEntry[];
    }>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        fromAsset: z.ZodString;
        toAsset: z.ZodString;
        amount: z.ZodString;
        address: z.ZodString;
        network: z.ZodDefault<z.ZodLiteral<"mainnet">>;
        privateKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        network: "mainnet";
        fromAsset: string;
        toAsset: string;
        amount: string;
        privateKey?: string | undefined;
    }, {
        address: string;
        fromAsset: string;
        toAsset: string;
        amount: string;
        network?: "mainnet" | undefined;
        privateKey?: string | undefined;
    }>;
    execute: ({ fromAsset, toAsset, amount, address, network, privateKey, }: {
        fromAsset: string;
        toAsset: string;
        amount: string;
        address: string;
        network: "mainnet";
        privateKey?: string;
    }) => Promise<{
        success: false;
        quote: QuoteResponse;
        message: string;
        txHash?: undefined;
        status?: undefined;
    } | {
        success: true;
        txHash: string;
        status: string;
        quote: QuoteResponse;
        message?: undefined;
    }>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        address: z.ZodString;
        assetCode: z.ZodString;
        network: z.ZodDefault<z.ZodLiteral<"mainnet">>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        address: string;
        network: "mainnet";
        privateKey: string;
        assetCode: string;
    }, {
        address: string;
        privateKey: string;
        assetCode: string;
        network?: "mainnet" | undefined;
    }>;
    execute: ({ address, assetCode, network, privateKey, }: {
        address: string;
        assetCode: string;
        network: "testnet" | "mainnet";
        privateKey: string;
    }) => Promise<{
        success: true;
        message: string;
        existing: boolean;
        txHash?: undefined;
    } | {
        success: true;
        txHash: string;
        message: string;
        existing: boolean;
    }>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        privateKey: z.ZodString;
        destination: z.ZodString;
        amount: z.ZodString;
        assetCode: z.ZodOptional<z.ZodString>;
        assetIssuer: z.ZodOptional<z.ZodString>;
        network: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"mainnet">>>;
    }, "strip", z.ZodTypeAny, {
        network: "mainnet";
        amount: string;
        privateKey: string;
        destination: string;
        assetCode?: string | undefined;
        assetIssuer?: string | undefined;
    }, {
        amount: string;
        privateKey: string;
        destination: string;
        network?: "mainnet" | undefined;
        assetCode?: string | undefined;
        assetIssuer?: string | undefined;
    }>;
    execute: ({ privateKey, destination, amount, assetCode, assetIssuer, network, }: {
        privateKey: string;
        destination: string;
        amount: string;
        assetCode?: string;
        assetIssuer?: string;
        network?: "mainnet";
    }) => Promise<{
        success: true;
        txHash: string;
        message: string;
    }>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        fromAsset: z.ZodString;
        toAsset: z.ZodString;
        amount: z.ZodString;
        network: z.ZodDefault<z.ZodLiteral<"mainnet">>;
    }, "strip", z.ZodTypeAny, {
        network: "mainnet";
        fromAsset: string;
        toAsset: string;
        amount: string;
    }, {
        fromAsset: string;
        toAsset: string;
        amount: string;
        network?: "mainnet" | undefined;
    }>;
    execute: ({ fromAsset, toAsset, amount, network, }: {
        fromAsset: string;
        toAsset: string;
        amount: string;
        network: "mainnet";
    }) => Promise<{
        success: true;
        quote: {
            fromAsset: string;
            toAsset: string;
            amountIn: string;
            amountOut: string;
            route: string[];
        };
        message: string;
    }>;
})[];
//# sourceMappingURL=agentTools.d.ts.map