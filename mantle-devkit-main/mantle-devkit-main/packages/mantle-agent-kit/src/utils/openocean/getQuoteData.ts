import axios from "axios";
import { OPENOCEAN_BASE_URL, OPENOCEAN_CHAIN } from "../../constants/openocean";
import { getHeaders } from "../../helpers/openocean";

export interface OpenOceanQuote {
  inToken: {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  outToken: {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  inAmount: string;
  outAmount: string;
  estimatedGas: string;
}

/**
 * Get swap quote from OpenOcean API
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param chain - Chain identifier ("mainnet" | "testnet")
 * @returns Quote data
 */
export async function getQuoteData(
  fromToken: string,
  toToken: string,
  amount: string,
  chain: "mainnet" | "testnet",
): Promise<OpenOceanQuote> {
  try {
    const chainName = OPENOCEAN_CHAIN[chain];
    const url = `${OPENOCEAN_BASE_URL}/${chainName}/quote`;

    const params = {
      inTokenAddress: fromToken,
      outTokenAddress: toToken,
      amount: amount,
      gasPrice: "5", // Default gas price in gwei
    };

    const response = await axios.get(url, {
      params,
      headers: getHeaders(),
    });

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(`OpenOcean API Error: ${response.data.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Failed to get OpenOcean quote:", (error as Error).message);
    throw error;
  }
}
