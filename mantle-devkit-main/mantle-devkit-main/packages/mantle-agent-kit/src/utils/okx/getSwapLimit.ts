import axios from "axios";
import { baseUrl } from "../../constants/okx";
import { getHeaders } from "../../helpers/okx";

/**
 * Get swap transaction data from DEX API
 * @param fromTokenAddress - Source token address
 * @param toTokenAddress - Destination token address
 * @param amount - Amount to swap
 * @param userWalletAddress - User wallet address
 * @param chainIndex - Chain index
 * @param slippagePercent - Maximum slippagePercent (e.g., "0.5" for 0.5%)
 * @returns Swap transaction data
 */
export async function getSwapTransaction(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  userWalletAddress: string,
  chainIndex: string,
  slippagePercent: string = "0.5",
): Promise<any> {
  try {
    const path = "dex/aggregator/swap";
    const url = `${baseUrl}${path}`;

    const params = {
      chainIndex,
      fromTokenAddress,
      toTokenAddress,
      amount,
      userWalletAddress,
      slippagePercent,
    };

    // Prepare authentication
    const timestamp = new Date().toISOString();
    const requestPath = `/api/v6/${path}`;
    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await axios.get(url, { params, headers });

    if (response.data.code === "0") {
      return response.data.data[0];
    } else {
      throw new Error(`API Error: ${response.data.msg || "Unknown error"}`);
    }
  } catch (error) {
    console.error(
      "Failed to get swap transaction data:",
      (error as Error).message,
    );
    throw error;
  }
}
