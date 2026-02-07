import { Asset, Horizon } from '@stellar/stellar-sdk';
export class NativeAmmClient {
    server;
    networkConfig;
    constructor(networkConfig) {
        this.networkConfig = networkConfig;
        this.server = new Horizon.Server(networkConfig.horizonUrl);
    }
    async getQuote(fromAssetStr, toAssetStr, amount) {
        try {
            // Convert asset strings to Stellar Asset objects
            const fromAsset = this.parseAsset(fromAssetStr);
            const toAsset = this.parseAsset(toAssetStr);
            // Use Stellar's path finding for real liquidity paths
            const paths = await this.server
                .strictSendPaths(fromAsset, amount, [toAsset])
                .call();
            if (paths.records.length === 0) {
                throw new Error(`No liquidity path found for ${fromAssetStr} → ${toAssetStr} on ${this.getNetworkName()}`);
            }
            const bestPath = paths.records[0];
            return {
                expectedIn: amount,
                expectedOut: bestPath.destination_amount,
                minOut: bestPath.destination_amount, // For demo, use same as expected
                route: bestPath.path.map((asset) => asset.asset_type === 'native'
                    ? 'XLM'
                    : `${asset.asset_code}:${asset.asset_issuer}`)
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('not found') || message.includes('no path')) {
                throw new Error(`No liquidity available for ${fromAssetStr} → ${toAssetStr} on ${this.getNetworkName()}. Try different assets or amounts.`);
            }
            throw error;
        }
    }
    async executeSwap(privateKey, quote, network) {
        // For demo purposes, return a simulated transaction
        // In production, this would build and submit a pathPaymentStrictSend transaction
        return {
            hash: `DEMO_TX_${Date.now().toString(36).toUpperCase()}`,
            status: 'SIMULATED_SUCCESS'
        };
    }
    parseAsset(assetStr) {
        if (assetStr === 'XLM') {
            return Asset.native();
        }
        const parts = assetStr.split(':');
        if (parts.length !== 2) {
            throw new Error(`Invalid asset format: ${assetStr}. Use 'CODE:ISSUER' or 'XLM'`);
        }
        return new Asset(parts[0], parts[1]);
    }
    getNetworkName() {
        return this.networkConfig.horizonUrl.includes('testnet') ? 'testnet' : 'mainnet';
    }
}
//# sourceMappingURL=nativeAmmClient.js.map