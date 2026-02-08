import { Asset, Horizon } from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks";

export interface QuoteResponse {
  expectedIn: string;
  expectedOut: string;
  minOut: string;
  route: string[];
}

export class NativeAmmClient {
  private server: Horizon.Server;
  private networkConfig: NetworkConfig;

  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig;
    this.server = new Horizon.Server(networkConfig.horizonUrl);
  }

  async getQuote(
    fromAssetStr: string,
    toAssetStr: string,
    amount: string
  ): Promise<QuoteResponse> {
    try {
      const fromAsset = this.parseAsset(fromAssetStr);
      const toAsset = this.parseAsset(toAssetStr);

      const paths = await this.server
        .strictSendPaths(fromAsset, amount, [toAsset])
        .call();

      if (paths.records.length === 0) {
        throw new Error(
          `No liquidity path found for ${fromAssetStr} → ${toAssetStr} on ${this.getNetworkName()}`
        );
      }

      const bestPath = paths.records[0];

      return {
        expectedIn: amount,
        expectedOut: bestPath.destination_amount,
        minOut: bestPath.destination_amount,
        route: bestPath.path.map(
          (asset: { asset_type?: string; asset_code?: string; asset_issuer?: string }) =>
            asset.asset_type === "native"
              ? "XLM"
              : `${asset.asset_code}:${asset.asset_issuer}`
        ),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("not found") || message.includes("no path")) {
        throw new Error(
          `No liquidity available for ${fromAssetStr} → ${toAssetStr} on ${this.getNetworkName()}. Try different assets or amounts.`
        );
      }
      throw error;
    }
  }

  async executeSwap(
    _privateKey: string,
    _quote: QuoteResponse,
    _network: string
  ): Promise<{ hash: string; status: string }> {
    throw new Error(
      "Execution not supported via NativeAmmClient. Use SoroSwap (set SOROSWAP_API_KEY) to execute swaps."
    );
  }

  private parseAsset(assetStr: string): Asset {
    if (assetStr === "XLM") {
      return Asset.native();
    }

    const parts = assetStr.split(":");
    if (parts.length !== 2) {
      throw new Error(
        `Invalid asset format: ${assetStr}. Use 'CODE:ISSUER' or 'XLM'`
      );
    }

    return new Asset(parts[0], parts[1]);
  }

  private getNetworkName(): string {
    return this.networkConfig.horizonUrl.includes("testnet")
      ? "testnet"
      : "mainnet";
  }
}
