import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSoroSwapDexClient } from "../dex/soroSwap.js";
import type { NetworkConfig } from "../config/networks.js";

const mockNetworkConfig: NetworkConfig = {
  network: "mainnet",
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.stellar.org",
};

const VALID_SECRET = "SCZANGBA5OISN7QDPCVVZLHNO5YNQE3YQ4JKXM3A6FX6T2MBW7YW4KR";
const USDC_CONTRACT = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
const XLM_CONTRACT  = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

describe("createSoroSwapDexClient", () => {
  beforeEach(() => vi.restoreAllMocks());

  describe("getQuote", () => {
    it("returns a parsed quote using contractId assets", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          expectedIn: "1000000",
          expectedOut: "500000",
          minOut: "490000",
          route: [XLM_CONTRACT, USDC_CONTRACT],
        }),
      }));

      const client = createSoroSwapDexClient(mockNetworkConfig);
      const result = await client.getQuote(
        { contractId: XLM_CONTRACT },
        { contractId: USDC_CONTRACT },
        "1000000"
      );

      expect(result.expectedIn).toBe("1000000");
      expect(result.expectedOut).toBe("500000");
      expect(result.minOut).toBe("490000");
    });

    it("falls back to amountIn/amountOut fields in API response", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ amountIn: "100", amountOut: "200" }),
      }));

      const client = createSoroSwapDexClient(mockNetworkConfig);
      const result = await client.getQuote(
        { contractId: XLM_CONTRACT },
        { contractId: USDC_CONTRACT },
        "100"
      );

      expect(result.expectedIn).toBe("100");
      expect(result.expectedOut).toBe("200");
    });

    it("throws when API returns non-ok status", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limited"),
      }));

      const client = createSoroSwapDexClient(mockNetworkConfig);
      await expect(
        client.getQuote({ contractId: XLM_CONTRACT }, { contractId: USDC_CONTRACT }, "100")
      ).rejects.toThrow("SoroSwap quote failed 429");
    });

    it("throws when asset has no contractId, code, or issuer", async () => {
      const client = createSoroSwapDexClient(mockNetworkConfig);
      await expect(
        // @ts-expect-error intentional invalid asset
        client.getQuote({}, { contractId: USDC_CONTRACT }, "100")
      ).rejects.toThrow("Asset must have contractId or code+issuer");
    });

    it("accepts code+issuer format", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ expectedIn: "50", expectedOut: "100", minOut: "95", route: [] }),
      }));

      const client = createSoroSwapDexClient(mockNetworkConfig);
      const result = await client.getQuote(
        { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
        { contractId: XLM_CONTRACT },
        "50"
      );
      expect(result.expectedIn).toBe("50");
    });
  });

  describe("executeSwap", () => {
    it("throws when SOROSWAP_API_KEY is missing", async () => {
      delete process.env.SOROSWAP_API_KEY;
      const client = createSoroSwapDexClient(mockNetworkConfig);
      await expect(
        client.executeSwap(VALID_SECRET, {
          expectedIn: "100",
          expectedOut: "200",
          minOut: "190",
          route: [],
          rawData: {},
        })
      ).rejects.toThrow("SOROSWAP_API_KEY");
    });
  });
});
