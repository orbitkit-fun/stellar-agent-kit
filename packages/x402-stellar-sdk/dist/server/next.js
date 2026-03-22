import {
  createPaymentRequiredResponse,
  processPaymentMiddleware
} from "../chunk-CBSQ4354.js";

// src/server/next.ts
async function withX402(requestHeaders, options) {
  const headers = {};
  requestHeaders.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  const result = await processPaymentMiddleware(headers, options);
  if (result.allowed) return null;
  const payment402 = createPaymentRequiredResponse(options);
  return new Response(JSON.stringify(payment402.body), {
    status: 402,
    headers: { "Content-Type": "application/json", ...payment402.headers }
  });
}
export {
  withX402
};
