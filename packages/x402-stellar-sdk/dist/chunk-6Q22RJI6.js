// src/client/index.ts
function parse402Response(response) {
  if (response.status !== 402) return null;
  const amount = response.headers.get("x-402-amount") ?? response.headers.get("X-402-Amount");
  const assetCode = response.headers.get("x-402-asset-code") ?? response.headers.get("X-402-Asset-Code");
  const network = response.headers.get("x-402-network") ?? response.headers.get("X-402-Network");
  const destination = response.headers.get("x-402-destination") ?? response.headers.get("X-402-Destination");
  const issuer = response.headers.get("x-402-issuer") ?? response.headers.get("X-402-Issuer") ?? void 0;
  const memo = response.headers.get("x-402-memo") ?? response.headers.get("X-402-Memo") ?? void 0;
  if (!amount || !assetCode || !network || !destination) return null;
  return { amount, assetCode, network, destination, ...issuer && { issuer }, ...memo && { memo } };
}
function addPaymentHeaders(headers, payment) {
  const h = new Headers(headers);
  h.set("X-402-Transaction-Hash", payment.transactionHash);
  if (payment.timestamp) h.set("X-402-Timestamp", payment.timestamp);
  return h;
}
async function x402Fetch(input, init, options) {
  const res = await fetch(input, init);
  const paymentRequest = parse402Response(res);
  if (!paymentRequest) return res;
  const payWithStellar = options?.payWithStellar;
  if (!payWithStellar) {
    throw new Error(
      "402 Payment Required. Provide x402Fetch(..., { payWithStellar }) to handle Stellar payments."
    );
  }
  const payment = await payWithStellar(paymentRequest);
  if (!payment) return res;
  const newHeaders = addPaymentHeaders(init?.headers ?? {}, payment);
  const retryInit = { ...init, headers: newHeaders };
  return fetch(input, retryInit);
}

export {
  x402Fetch
};
