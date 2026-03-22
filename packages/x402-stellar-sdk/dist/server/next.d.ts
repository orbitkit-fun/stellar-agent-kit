import { X as X402StellarOptions } from '../types-CibbvCHY.js';

/**
 * Next.js adapter for x402 – verify payment in API routes and return 402 or continue.
 */

/**
 * Use in Next.js API route (App Router or Pages API).
 * Pass the request headers and your x402 options; returns null if paid, or a NextResponse with 402 if not.
 */
declare function withX402(requestHeaders: Headers, options: X402StellarOptions): Promise<Response | null>;

export { X402StellarOptions, withX402 };
