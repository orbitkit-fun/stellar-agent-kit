import { Horizon } from "@stellar/stellar-sdk";
import type { NetworkConfig } from "../config/networks.js";
type SubmitTransactionResponse = Horizon.HorizonApi.SubmitTransactionResponse;
export interface BalanceEntry {
    code: string;
    issuer: string | null;
    balance: string;
}
/**
 * Stellar client for account queries and payment submission.
 * Uses Horizon for classic operations (balance, payments).
 */
export declare class StellarClient {
    private readonly server;
    private readonly config;
    constructor(config: NetworkConfig);
    /**
     * Fetch all balances for an account (XLM + trust lines).
     */
    getBalance(address: string): Promise<BalanceEntry[]>;
    /**
     * Send a payment (XLM or custom asset).
     * @param fromSecret - Secret key of sender (S...)
     * @param to - Destination public key (G...)
     * @param amount - Amount as string (e.g. "100" or "10.5")
     * @param assetCode - Optional; if omitted, sends XLM
     * @param assetIssuer - Required when assetCode is set (issuer G...)
     */
    sendPayment(fromSecret: string, to: string, amount: string, assetCode?: string, assetIssuer?: string): Promise<SubmitTransactionResponse>;
}
export {};
//# sourceMappingURL=stellarClient.d.ts.map