/**
 * Network config – mainnet & testnet.
 */

export const mainnet = {
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
} as const;

export const testnet = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
} as const;

export interface NetworkConfig {
  readonly horizonUrl: string;
  readonly sorobanRpcUrl: string;
}

export type NetworkName = "mainnet" | "testnet";

export function getNetworkConfig(_name?: string): NetworkConfig {
  if (_name === "testnet") return testnet;
  return mainnet;
}
