/**
 * x402 client – payment request from 402 response.
 */
interface X402PaymentRequest {
    amount: string;
    assetCode: string;
    issuer?: string;
    network: string;
    destination: string;
    memo?: string;
}
interface X402PaymentResponse {
    transactionHash: string;
    timestamp?: string;
}
interface X402ClientOptions {
    /** Retry request after payment (default true) */
    autoRetry?: boolean;
    /** Pluggable: perform Stellar payment (e.g. Freighter), return tx hash */
    payWithStellar?: (req: X402PaymentRequest) => Promise<X402PaymentResponse | null>;
}

/**
 * x402 client – fetch with automatic 402 handling and Stellar payment flow.
 */

/**
 * Fetch that handles 402: on 402, calls payWithStellar (or throws), then retries with payment headers.
 */
declare function x402Fetch(input: RequestInfo | URL, init?: RequestInit, options?: X402ClientOptions): Promise<Response>;

export { type X402ClientOptions, type X402PaymentRequest, type X402PaymentResponse, x402Fetch };
