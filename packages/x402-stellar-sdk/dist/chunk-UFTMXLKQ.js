import {
  createPaymentRequiredResponse,
  processPaymentMiddleware
} from "./chunk-CBSQ4354.js";

// src/server/index.ts
function x402(options) {
  if (!options.price || !options.assetCode || !options.destination || !options.network) {
    throw new Error("x402() requires price, assetCode, destination, and network");
  }
  return async (req, res, next) => {
    const headers = {};
    if (typeof req.headers === "object") {
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers[k.toLowerCase()] = v;
      }
    }
    const result = await processPaymentMiddleware(headers, options);
    if (result.allowed) return next();
    const payment402 = createPaymentRequiredResponse(options);
    res.status(402).json(payment402.body);
  };
}

export {
  x402
};
