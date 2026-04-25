import { describe, it, expect, vi, beforeEach } from "vitest";
import { Horizon } from "@stellar/stellar-sdk";
import { StellarAgentKit } from "../agent.js";

// Valid Stellar keypair (same keys used in env.test.ts)
const VALID_SECRET = "SCZWJ5X5NPL6I6ET6QRTQZLXH6CCPIYKIACHGUPMAZHMFVYUL234JVXC";
const VALID_PUBLIC = "GAMVCXSK654EKLOWMPJZCGUXKEW7X5RF74YZ6GBZV2FUJGJT6XG7HMHI";
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    Horizon: {
      ...(actual.Horizon as Record<string, unknown>),
      Server: vi.fn(),
    },
  };
});

function makeMockHorizonInstance() {
  return {
    loadAccount: vi.fn().mockResolvedValue({
      accountId: () => VALID_PUBLIC,
      sequenceNumber: () => "100",
      incrementSequenceNumber: vi.fn(),
      balances: [],
    }),
    submitTransaction: vi.fn().mockResolvedValue({ hash: "mockhash123" }),
  };
}

describe("StellarAgentKit", () => {
  beforeEach(() => {
    vi.mocked(Horizon.Server).mockImplementation(
      () => makeMockHorizonInstance() as unknown as Horizon.Server
    );
  });

  it("constructs without throwing", () => {
    const agent = new StellarAgentKit(VALID_SECRET, "mainnet");
    expect(agent.network).toBe("mainnet");
    expect(agent.keypair.publicKey()).toMatch(/^G[A-Z2-7]{55}$/);
  });

  it("throws when protocol methods called before initialize()", async () => {
    const agent = new StellarAgentKit(VALID_SECRET, "mainnet");
    await expect(agent.getBalances()).rejects.toThrow("not initialized");
    await expect(agent.createTrustline("USDC", USDC_ISSUER)).rejects.toThrow("not initialized");
  });
});

describe("StellarAgentKit#createTrustline", () => {
  let agent: StellarAgentKit;
  let mockInstance: ReturnType<typeof makeMockHorizonInstance>;

  beforeEach(async () => {
    mockInstance = makeMockHorizonInstance();
    vi.mocked(Horizon.Server).mockImplementation(
      () => mockInstance as unknown as Horizon.Server
    );
    agent = new StellarAgentKit(VALID_SECRET, "mainnet");
    await agent.initialize();
  });

  it("submits a changeTrust transaction and returns a hash", async () => {
    const result = await agent.createTrustline("USDC", USDC_ISSUER);
    expect(result.hash).toBe("mockhash123");
    expect(mockInstance.submitTransaction).toHaveBeenCalledOnce();
  });

  it("accepts a custom trust limit", async () => {
    const result = await agent.createTrustline("USDC", USDC_ISSUER, "1000");
    expect(result.hash).toBe("mockhash123");
    expect(mockInstance.submitTransaction).toHaveBeenCalledOnce();
  });

  it("removeTrustline delegates to createTrustline with limit '0'", async () => {
    const spy = vi.spyOn(agent, "createTrustline");
    spy.mockResolvedValue({ hash: "mockhash123" });
    await agent.removeTrustline("USDC", USDC_ISSUER);
    expect(spy).toHaveBeenCalledWith("USDC", USDC_ISSUER, "0");
  });

  it("propagates Horizon errors", async () => {
    mockInstance.submitTransaction.mockRejectedValue(new Error("tx_bad_auth"));
    await expect(agent.createTrustline("USDC", USDC_ISSUER)).rejects.toThrow("tx_bad_auth");
  });
});

describe("StellarAgentKit#removeTrustline", () => {
  let agent: StellarAgentKit;
  let mockInstance: ReturnType<typeof makeMockHorizonInstance>;

  beforeEach(async () => {
    mockInstance = makeMockHorizonInstance();
    vi.mocked(Horizon.Server).mockImplementation(
      () => mockInstance as unknown as Horizon.Server
    );
    agent = new StellarAgentKit(VALID_SECRET, "mainnet");
    await agent.initialize();
  });

  it("submits a changeTrust transaction with limit '0' and returns a hash", async () => {
    const result = await agent.removeTrustline("USDC", USDC_ISSUER);
    expect(result.hash).toBe("mockhash123");
    expect(mockInstance.submitTransaction).toHaveBeenCalledOnce();
  });
});
