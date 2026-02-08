import { z } from "zod";

export const NetworkConfigSchema = z.object({
  horizonUrl: z.string().url(),
  sorobanRpcUrl: z.string().url(),
  friendbotUrl: z.string().url().optional(),
});

export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;

/** Mainnet config. This project is mainnet-only. */
export const mainnet: NetworkConfig = {
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
};

export const networks = { mainnet } as const;
export type NetworkName = keyof typeof networks;

/** Returns mainnet config. This project is mainnet-only. */
export function getNetworkConfig(name?: string): NetworkConfig {
  if (name && name !== "mainnet") {
    throw new Error("This project is mainnet-only. Use network: 'mainnet'.");
  }
  return mainnet;
}
