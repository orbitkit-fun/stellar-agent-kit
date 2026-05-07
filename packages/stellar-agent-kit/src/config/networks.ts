import { z } from "zod";

export const NetworkConfigSchema = z.object({
  network: z.enum(["mainnet", "testnet"]),
  horizonUrl: z.string().url(),
  sorobanRpcUrl: z.string().url(),
  friendbotUrl: z.string().url().optional(),
});

export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;

/** Mainnet config. */
export const mainnet: NetworkConfig = {
  network: "mainnet",
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
};

/** Testnet config. */
export const testnet: NetworkConfig = {
  network: "testnet",
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  friendbotUrl: "https://friendbot.stellar.org",
};

export const networks = { mainnet, testnet } as const;
export type NetworkName = keyof typeof networks;

/** Returns network config for mainnet or testnet. */
export function getNetworkConfig(name: NetworkName = "mainnet"): NetworkConfig {
  if (name === "testnet") return testnet;
  return mainnet;
}
