import {
  createPaymentRequiredResponse,
  processPaymentMiddleware
} from "../chunk-CBSQ4354.js";

// src/server/hono.ts
function x402Hono(options) {
  if (!options.price || !options.assetCode || !options.destination || !options.network) {
    throw new Error("x402Hono() requires price, assetCode, destination, and network");
  }
  return async (c, next) => {
    const raw = c.req.raw;
    const headers = {};
    raw.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    const result = await processPaymentMiddleware(headers, options);
    if (!result.allowed) {
      const payment402 = createPaymentRequiredResponse(options);
      return c.json(payment402.body, 402, payment402.headers);
    }
    await next();
  };
}
export {
  x402Hono
};
