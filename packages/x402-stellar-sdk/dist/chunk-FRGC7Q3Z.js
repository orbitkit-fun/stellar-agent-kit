// src/server/verify.ts
var HORIZON = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org"
};
function decodeMemo(memoType, memoValue) {
  if (memoType !== "text" || !memoValue) return null;
  try {
    const base64 = memoValue.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof Buffer !== "undefined") return Buffer.from(base64, "base64").toString("utf8");
    return atob(base64);
  } catch {
    return null;
  }
}
async function verifyPaymentOnChain(txHash, options) {
  const base = HORIZON[options.network];
  let tx;
  try {
    const res = await fetch(`${base}/transactions/${txHash}`);
    if (!res.ok) return { valid: false, error: `Horizon ${res.status}: ${await res.text()}` };
    tx = await res.json();
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Failed to fetch transaction" };
  }
  if (!tx.successful) return { valid: false, error: "Transaction not successful" };
  if (options.memo && tx.memo_type && tx.memo) {
    const decoded = decodeMemo(tx.memo_type, tx.memo);
    if (decoded !== options.memo) return { valid: false, error: "Memo mismatch" };
  }
  const paymentsRes = await fetch(`${base}/transactions/${txHash}/operations?limit=20`);
  if (!paymentsRes.ok) return { valid: false, error: "Failed to fetch operations" };
  const opsData = await paymentsRes.json();
  const records = opsData._embedded?.records ?? [];
  const paymentOps = records.filter((r) => r.type === "payment");
  const requiredAmount = parseFloat(options.price);
  const isNative = !options.issuer && (options.assetCode === "XLM" || !options.assetCode);
  for (const op of paymentOps) {
    if (op.to !== options.destination) continue;
    const amount = parseFloat(op.amount);
    if (amount < requiredAmount) continue;
    if (isNative && op.asset_type === "native") return { valid: true };
    if (!isNative && options.issuer && op.asset_type !== "native" && op.asset_code === options.assetCode && op.asset_issuer === options.issuer) return { valid: true };
  }
  return { valid: false, error: "No matching payment to destination with required amount/asset" };
}

export {
  verifyPaymentOnChain
};
