import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyPayment, buildPaymentRequiredResponse, checkPayment } from "../x402.js";
import type { X402Options } from "../x402.js";

const BASE_OPTS: X402Options = {
  destination: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  price: "1.0",
  assetCode: "XLM",
  network: "testnet",
};

const FAKE_TX_HASH = "abc123def456abc123def456abc123def456abc123def456abc123def456abc1";

// ── verifyPayment ─────────────────────────────────────────────────────────────
describe("verifyPayment", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns valid:true when payment matches destination, amount, and native asset", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: BASE_OPTS.destination,
              amount: "1.0000000",
              asset_type: "native",
            }],
          },
        }),
      })
    );

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns valid:false when transaction is not successful", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ successful: false }),
    }));

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Transaction not successful");
  });

  it("returns valid:false when Horizon returns non-ok status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    }));

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Horizon 404");
  });

  it("returns valid:false when fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network error")));

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("returns valid:false when payment amount is less than required", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: BASE_OPTS.destination,
              amount: "0.5000000", // less than 1.0
              asset_type: "native",
            }],
          },
        }),
      })
    );

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("No matching payment found");
  });

  it("returns valid:false when payment destination does not match", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: "GDIFFERENTADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXREPLACE",
              amount: "1.0000000",
              asset_type: "native",
            }],
          },
        }),
      })
    );

    const result = await verifyPayment(FAKE_TX_HASH, BASE_OPTS);
    expect(result.valid).toBe(false);
  });

  it("validates memo when opts.memo is set", async () => {
    const optsWithMemo = { ...BASE_OPTS, memo: "order-123" };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        successful: true,
        memo: "wrong-memo",
        memo_type: "text",
      }),
    }));

    const result = await verifyPayment(FAKE_TX_HASH, optsWithMemo);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Memo mismatch");
  });

  it("validates non-native (USDC) payment correctly", async () => {
    const usdcOpts: X402Options = {
      destination: BASE_OPTS.destination,
      price: "5.0",
      assetCode: "USDC",
      issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      network: "testnet",
    };

    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: usdcOpts.destination,
              amount: "5.0000000",
              asset_type: "credit_alphanum4",
              asset_code: "USDC",
              asset_issuer: usdcOpts.issuer,
            }],
          },
        }),
      })
    );

    const result = await verifyPayment(FAKE_TX_HASH, usdcOpts);
    expect(result.valid).toBe(true);
  });
});

// ── buildPaymentRequiredResponse ──────────────────────────────────────────────
describe("buildPaymentRequiredResponse", () => {
  it("returns correct headers for native XLM payment", () => {
    const { headers, body } = buildPaymentRequiredResponse(BASE_OPTS);

    expect(headers["X-402-Amount"]).toBe("1.0");
    expect(headers["X-402-Asset-Code"]).toBe("XLM");
    expect(headers["X-402-Network"]).toBe("testnet");
    expect(headers["X-402-Destination"]).toBe(BASE_OPTS.destination);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-402-Issuer"]).toBeUndefined();
  });

  it("includes issuer header for non-native assets", () => {
    const opts = { ...BASE_OPTS, assetCode: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" };
    const { headers } = buildPaymentRequiredResponse(opts);
    expect(headers["X-402-Issuer"]).toBe(opts.issuer);
  });

  it("includes memo header when specified", () => {
    const opts = { ...BASE_OPTS, memo: "ref-42" };
    const { headers, body } = buildPaymentRequiredResponse(opts);
    expect(headers["X-402-Memo"]).toBe("ref-42");
    expect(body.memo).toBe("ref-42");
  });

  it("body error field is 'Payment Required'", () => {
    const { body } = buildPaymentRequiredResponse(BASE_OPTS);
    expect(body.error).toBe("Payment Required");
  });
});

// ── checkPayment ──────────────────────────────────────────────────────────────
describe("checkPayment", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns paid:false when no tx hash header", async () => {
    const result = await checkPayment({}, BASE_OPTS);
    expect(result.paid).toBe(false);
    expect(result.error).toBe("No payment receipt provided");
  });

  it("returns paid:false when tx hash header is present but payment invalid", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: false, status: 404,
    }));

    const result = await checkPayment(
      { "x-402-transaction-hash": FAKE_TX_HASH },
      BASE_OPTS
    );
    expect(result.paid).toBe(false);
  });

  it("returns paid:true and txHash when payment is valid (Headers API)", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: BASE_OPTS.destination,
              amount: "1.0000000",
              asset_type: "native",
            }],
          },
        }),
      })
    );

    const headers = new Headers({ "x-402-transaction-hash": FAKE_TX_HASH });
    const result = await checkPayment(headers, BASE_OPTS);
    expect(result.paid).toBe(true);
    expect(result.txHash).toBe(FAKE_TX_HASH);
  });

  it("works with plain object headers (case-insensitive)", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ successful: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: {
            records: [{
              type: "payment",
              to: BASE_OPTS.destination,
              amount: "2.0000000",
              asset_type: "native",
            }],
          },
        }),
      })
    );

    const result = await checkPayment(
      { "x-402-transaction-hash": FAKE_TX_HASH },
      { ...BASE_OPTS, price: "1.0" }
    );
    expect(result.paid).toBe(true);
  });
});
