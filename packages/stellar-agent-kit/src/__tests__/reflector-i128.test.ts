import { describe, it, expect } from "vitest";
import { xdr } from "@stellar/stellar-sdk";

/**
 * BUGGY REFERENCE IMPLEMENTATION (the original code with bugs).
 * Used to prove the fix corrects the 32-bit shift bug and Number precision bug.
 */
function scValToI128_BUGGY(val: xdr.ScVal): string {
  const i128 = val.i128();
  if (!i128) throw new Error("Expected i128 price");
  const lo = i128.lo();
  const hi = i128.hi();
  if (!lo || hi === undefined) return "0";
  const loNum = Number(lo);
  const hiNum = Number(hi);
  const negative = hiNum < 0;
  const absLo = loNum < 0 ? 0x100000000 + loNum : loNum;
  const absHi = hiNum < 0 ? 0x100000000 + hiNum : hiNum;
  let n = BigInt(absLo) + (BigInt(absHi) << 32n);
  if (negative) n = -n;
  return String(n);
}

/**
 * FIXED IMPLEMENTATION (pure BigInt, 64-bit shift).
 */
function scValToI128_FIXED(val: xdr.ScVal): string {
  const i128 = val.i128();
  if (!i128) throw new Error("Expected i128 price");
  const lo = i128.lo();
  const hi = i128.hi();
  if (lo == null || hi == null) return "0";
  // BUG FIX: use BigInt(x.toString()) for exact u64/i64 conversion;
  // shift by 64n (not 32n) — the correct width of the lo half.
  const loBig = BigInt(lo.toString());
  const hiBig = BigInt(hi.toString());
  const n = loBig + (hiBig << 64n);
  return String(n);
}

/**
 * Helper to construct an i128 ScVal from hi and lo.
 */
function makeI128ScVal(hi: bigint, lo: bigint): xdr.ScVal {
  const hiPart = xdr.Int64.fromString(String(hi));
  const loPart = xdr.Uint64.fromString(String(lo));
  const i128Parts = new xdr.Int128Parts({ hi: hiPart, lo: loPart });
  return xdr.ScVal.scvI128(i128Parts);
}

describe("scValToI128 bug fixes", () => {
  it("small value with hi=0 — both implementations agree", () => {
    const val = makeI128ScVal(0n, 123456n);
    const fixed = scValToI128_FIXED(val);
    const buggy = scValToI128_BUGGY(val);
    expect(fixed).toBe("123456");
    expect(buggy).toBe("123456");
  });

  it("zero i128 — edge case", () => {
    const val = makeI128ScVal(0n, 0n);
    const fixed = scValToI128_FIXED(val);
    const buggy = scValToI128_BUGGY(val);
    expect(fixed).toBe("0");
    expect(buggy).toBe("0");
  });

  it("hi != 0 — exposes 32-bit shift bug (should be 64-bit)", () => {
    // value = 2^64 (hi=1, lo=0)
    // Fixed:  1 * 2^64 = 18446744073709551616
    // Buggy:  1 * 2^32 = 4294967296 (wrong by factor of 4 billion)
    const val = makeI128ScVal(1n, 0n);
    const fixed = scValToI128_FIXED(val);
    const buggy = scValToI128_BUGGY(val);
    expect(fixed).toBe("18446744073709551616");
    expect(buggy).toBe("4294967296"); // buggy result
    expect(fixed).not.toBe(buggy);
  });

  it("lo > 2^53 — exposes Number precision loss bug", () => {
    // 2^53 + 1 = 9007199254740993
    // Number(2^53+1) loses the +1 because mantissa has only 53 bits
    const val = makeI128ScVal(0n, 9007199254740993n);
    const fixed = scValToI128_FIXED(val);
    const buggy = scValToI128_BUGGY(val);
    expect(fixed).toBe("9007199254740993");
    // Buggy implementation loses precision for values > 2^53
    expect(buggy).not.toBe(fixed);
  });

  it("negative i128 — negative hi is handled correctly", () => {
    // hi = -1, lo = 0 → value = -2^64
    // Fixed should compute: 0 + (-1 << 64) = -18446744073709551616
    const val = makeI128ScVal(-1n, 0n);
    const fixed = scValToI128_FIXED(val);
    expect(fixed).toBe("-18446744073709551616");
    // Buggy will produce incorrect result due to 32-bit shift
    const buggy = scValToI128_BUGGY(val);
    expect(buggy).not.toBe(fixed);
  });

  it("large realistic price — BTC at ~$50k with 7 decimals", () => {
    // BTC price: $50,000.00 with 7 decimal precision → 500000000000 (500 billion stroops)
    // Fits in lo (u64 max = 18.4 quintillion), hi = 0
    const priceValue = 500000000000n;
    const val = makeI128ScVal(0n, priceValue);
    const fixed = scValToI128_FIXED(val);
    const buggy = scValToI128_BUGGY(val);
    expect(fixed).toBe("500000000000");
    expect(buggy).toBe("500000000000");
    // Both agree here because hi=0 and lo < 2^53
  });
});
