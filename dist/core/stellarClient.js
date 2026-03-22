"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarClient = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const zod_1 = require("zod");
const StellarAddressSchema = zod_1.z
    .string()
    .min(56)
    .max(56)
    .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar public key (G...)");
const SecretKeySchema = zod_1.z
    .string()
    .min(56)
    .max(56)
    .regex(/^S[A-Z2-7]{55}$/, "Invalid Stellar secret key (S...)");
const AmountSchema = zod_1.z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a positive number");
/**
 * Stellar client for account queries and payment submission.
 * Uses Horizon for classic operations (balance, payments).
 */
class StellarClient {
    server;
    config;
    constructor(config) {
        this.config = config;
        this.server = new stellar_sdk_1.Horizon.Server(config.horizonUrl);
    }
    /**
     * Fetch all balances for an account (XLM + trust lines).
     */
    async getBalance(address) {
        const normalized = address.trim();
        if (!stellar_sdk_1.StrKey.isValidEd25519PublicKey(normalized)) {
            throw new Error("Stellar address has invalid checksum or format. Check for typos or extra spaces; use a 56-character key starting with G.");
        }
        const parsed = StellarAddressSchema.safeParse(normalized);
        if (!parsed.success) {
            throw new Error(parsed.error.errors.map((e) => e.message).join("; "));
        }
        const networkLabel = this.config.horizonUrl.includes("testnet") ? "testnet" : "mainnet";
        const account = await this.server
            .accounts()
            .accountId(parsed.data)
            .call()
            .catch((err) => {
            const res = err && typeof err === "object" && "response" in err
                ? err.response
                : undefined;
            if (res?.status === 404) {
                throw new Error(`Account not found on ${networkLabel}: ${address}. If you use mainnet, ask for balance "on mainnet". New accounts must be funded first.`);
            }
            throw err;
        });
        const balances = account.balances.map((b) => {
            if (b.asset_type === "native") {
                return {
                    code: "XLM",
                    issuer: null,
                    balance: b.balance,
                };
            }
            const asset = b;
            return {
                code: asset.asset_code,
                issuer: asset.asset_issuer ?? null,
                balance: asset.balance,
            };
        });
        return balances;
    }
    /**
     * Send a payment (XLM or custom asset).
     * @param fromSecret - Secret key of sender (S...)
     * @param to - Destination public key (G...)
     * @param amount - Amount as string (e.g. "100" or "10.5")
     * @param assetCode - Optional; if omitted, sends XLM
     * @param assetIssuer - Required when assetCode is set (issuer G...)
     */
    async sendPayment(fromSecret, to, amount, assetCode, assetIssuer) {
        const secretParsed = SecretKeySchema.safeParse(fromSecret);
        if (!secretParsed.success) {
            throw new Error(secretParsed.error.errors.map((e) => e.message).join("; "));
        }
        const toParsed = StellarAddressSchema.safeParse(to);
        if (!toParsed.success) {
            throw new Error(toParsed.error.errors.map((e) => e.message).join("; "));
        }
        const amountParsed = AmountSchema.safeParse(amount);
        if (!amountParsed.success) {
            throw new Error(amountParsed.error.errors.map((e) => e.message).join("; "));
        }
        const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(secretParsed.data);
        const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());
        const asset = assetCode && assetIssuer
            ? new stellar_sdk_1.Asset(assetCode, assetIssuer)
            : stellar_sdk_1.Asset.native();
        const op = stellar_sdk_1.Operation.payment({
            destination: toParsed.data,
            asset,
            amount: amountParsed.data,
        });
        const networkPassphrase = this.config.horizonUrl.includes("testnet")
            ? stellar_sdk_1.Networks.TESTNET
            : stellar_sdk_1.Networks.PUBLIC;
        const tx = new stellar_sdk_1.TransactionBuilder(sourceAccount, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase,
        })
            .addOperation(op)
            .setTimeout(30)
            .build();
        tx.sign(sourceKeypair);
        return await this.server.submitTransaction(tx);
    }
}
exports.StellarClient = StellarClient;
//# sourceMappingURL=stellarClient.js.map