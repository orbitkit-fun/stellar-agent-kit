/**
 * Network config – mainnet only.
 */
export declare const mainnet: {
    readonly horizonUrl: "https://horizon.stellar.org";
    readonly sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm";
};
export type NetworkConfig = typeof mainnet;
export type NetworkName = "mainnet";
export declare function getNetworkConfig(_name?: string): NetworkConfig;
//# sourceMappingURL=networks.d.ts.map