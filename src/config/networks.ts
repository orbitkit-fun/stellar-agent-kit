/**
 * Network config – mainnet only.
 */

export const mainnet = {
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
} as const;

export type NetworkConfig = typeof mainnet;

export function getNetworkConfig(_name?: string): NetworkConfig {
  return mainnet;
}
