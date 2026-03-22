/**
 * x402 server options – Stellar payment metadata (asset code + issuer, not ERC20).
 */
interface X402StellarOptions {
    /** Price amount (e.g. "10.5") */
    price: string;
    /** Asset code (e.g. "XLM", "USDC") */
    assetCode: string;
    /** Issuer account ID (G...) for custom assets; omit for native XLM */
    issuer?: string;
    /** "mainnet" | "testnet" */
    network: "mainnet" | "testnet";
    /** Destination account that receives payment (G...) */
    destination: string;
    /** Optional memo (e.g. request id) for payment correlation */
    memo?: string;
}
interface PaymentRequiredResponse {
    status: 402;
    headers: Record<string, string>;
    body: {
        error: "Payment Required";
        amount: string;
        assetCode: string;
        issuer?: string;
        network: string;
        destination: string;
        memo?: string;
    };
}

export type { PaymentRequiredResponse as P, X402StellarOptions as X };
