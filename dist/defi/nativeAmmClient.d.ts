import type { NetworkConfig } from '../config/networks.js';
export interface QuoteResponse {
    expectedIn: string;
    expectedOut: string;
    minOut: string;
    route: string[];
}
export declare class NativeAmmClient {
    private server;
    private networkConfig;
    constructor(networkConfig: NetworkConfig);
    getQuote(fromAssetStr: string, toAssetStr: string, amount: string): Promise<QuoteResponse>;
    executeSwap(privateKey: string, quote: QuoteResponse, network: string): Promise<{
        hash: string;
        status: string;
    }>;
    private parseAsset;
    private getNetworkName;
}
//# sourceMappingURL=nativeAmmClient.d.ts.map