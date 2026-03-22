import { X as X402StellarOptions } from '../types-CibbvCHY.js';

/**
 * Hono adapter for x402 – use x402Hono(options) as middleware.
 */

type HonoContext = {
    req: {
        header: (name: string) => string | undefined;
        raw: Request;
    };
    json: (body: unknown, status?: number, headers?: Record<string, string>) => Response;
};
type HonoNext = () => Promise<void>;
/**
 * x402 middleware for Hono. Returns 402 with Stellar payment metadata when payment is missing or invalid.
 */
declare function x402Hono(options: X402StellarOptions): (c: HonoContext, next: HonoNext) => Promise<Response | undefined>;

export { x402Hono };
