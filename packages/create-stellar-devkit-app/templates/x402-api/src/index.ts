/**
 * Minimal x402 API – premium route gated by Stellar payment.
 */
import express from "express";
import { x402 } from "x402-stellar-sdk/server";

const app = express();
app.use(express.json());

//remove the dummy placeholder Stellar address "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2X"
const destination = process.env.X402_DESTINATION;
if (!destination) throw new Error("X402_DESTINATION is required. Set it in .env or .env.local.");
const network = (process.env.NETWORK === "mainnet" ? "mainnet" : "testnet") as "mainnet" | "testnet";

app.use(
  "/api/premium",
  x402({
    price: "1",
    assetCode: "XLM",
    network,
    destination,
    memo: "premium-api",
  })
);

app.get("/api/premium", (_req, res) => {
  res.json({ data: "Premium content – payment verified." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`x402 API at http://localhost:${port}`));
