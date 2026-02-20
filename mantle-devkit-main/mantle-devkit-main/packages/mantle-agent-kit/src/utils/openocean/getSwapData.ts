import axios from "axios";
import { OPENOCEAN_BASE_URL, OPENOCEAN_CHAIN } from "../../constants/openocean";
import { getHeaders } from "../../helpers/openocean";

export interface OpenOceanSwapData {
  inToken: {
    address: string;
    decimals: number;
    symbol: string;
  };
  outToken: {
    address: string;
    decimals: number;
    symbol: string;
  };
  inAmount: string;
  outAmount: string;
  estimatedGas: string;
  minOutAmount: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
}

/**
 * Get swap transaction data from OpenOcean API
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param userAddress - User's wallet address
 * @param slippage - Slippage percentage (e.g., "1" for 1%)
 * @param chain - Chain identifier ("mainnet" | "testnet")
 * @returns Swap transaction data
 */
export async function getSwapData(
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  slippage: string,
  chain: "mainnet" | "testnet",
): Promise<OpenOceanSwapData> {
  try {
    const chainName = OPENOCEAN_CHAIN[chain];
    const url = `${OPENOCEAN_BASE_URL}/${chainName}/swap`;

    const params = {
      inTokenAddress: fromToken,
      outTokenAddress: toToken,
      amount: amount,
      gasPrice: "5", // Default gas price in gwei
      slippage: slippage,
      account: userAddress,
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
    console.error("Failed to get OpenOcean swap data:", (error as Error).message);
    throw error;
  }
}
