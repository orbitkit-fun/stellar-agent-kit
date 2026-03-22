// src/server/middleware.ts
function createPaymentRequiredResponse(options) {
  const headers = {
    "Content-Type": "application/json",
    "X-402-Amount": options.price,
    "X-402-Asset-Code": options.assetCode,
    "X-402-Network": options.network,
    "X-402-Destination": options.destination
  };
  if (options.issuer) headers["X-402-Issuer"] = options.issuer;
  if (options.memo) headers["X-402-Memo"] = options.memo;
  return {
    status: 402,
    headers,
    body: {
      error: "Payment Required",
      amount: options.price,
      assetCode: options.assetCode,
      ...options.issuer && { issuer: options.issuer },
      network: options.network,
      destination: options.destination,
      ...options.memo && { memo: options.memo }
    }
  };
}
async function processPaymentMiddleware(requestHeaders, options) {
  const txHash = requestHeaders["x-402-transaction-hash"] ?? requestHeaders["X-402-Transaction-Hash"];
  if (!txHash?.trim()) return { allowed: false };
  const { verifyPaymentOnChain } = await import("./verify-YIB2KFUK.js");
  const { valid, error } = await verifyPaymentOnChain(txHash.trim(), options);
  if (!valid) return { allowed: false };
  return { allowed: true };
}

export {
  createPaymentRequiredResponse,
  processPaymentMiddleware
};
