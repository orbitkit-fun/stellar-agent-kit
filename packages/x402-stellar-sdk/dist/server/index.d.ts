import { X as X402StellarOptions, P as PaymentRequiredResponse } from '../types-CibbvCHY.js';

/**
 * Core x402 middleware – returns 402 with Stellar payment metadata.
 * Framework-agnostic; Hono/Express adapters call this.
 */

interface MiddlewareResult {
    allowed: boolean;
    paymentRequired?: PaymentRequiredResponse;
}
/**
 * Create 402 response body and headers for Stellar payment.
 * Client uses: destination, amount, assetCode, issuer, network, memo to create payment.
 */
declare function createPaymentRequiredResponse(options: X402StellarOptions): PaymentRequiredResponse;
/**
 * Process payment check: extract receipt from headers and verify on Horizon.
 */
declare function processPaymentMiddleware(requestHeaders: Record<string, string>, options: X402StellarOptions): Promise<MiddlewareResult>;

/**
 * Verify Stellar payment on Horizon (transaction hash + destination/amount/asset/memo).
 */

/**
 * Verify that the transaction with given hash paid the destination with at least the required amount/asset.
 */
declare function verifyPaymentOnChain(txHash: string, options: X402StellarOptions): Promise<{
    valid: boolean;
    error?: string;
}>;

/**
 * x402 server – Stellar payment-gated middleware.
 * Same ergonomics as x402-mantle-sdk: x402({ price, assetCode, issuer, network, destination }).
 */

/** Express-style request (headers) and response (status + json). */
type X402Request = {
    headers: Record<string, string | string[] | undefined>;
};
type X402Response = {
    status(n: number): {
        json(b: unknown): void;
    };
    json(b: unknown): void;
};
type X402Next = () => void | Promise<void>;
/**
 * x402 middleware – use in Express/Hono/Next.
 * On missing/invalid payment: respond 402 with Stellar payment metadata.
 * On valid payment: call next().
 */
declare function x402(options: X402StellarOptions): (req: X402Request, res: X402Response, next: X402Next) => Promise<void>;

export { PaymentRequiredResponse, type X402Next, type X402Request, type X402Response, X402StellarOptions, createPaymentRequiredResponse, processPaymentMiddleware, verifyPaymentOnChain, x402 };
