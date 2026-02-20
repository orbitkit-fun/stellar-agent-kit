import axios from "axios";
import { baseUrl } from "../../constants/okx";
import { getHeaders } from "../../helpers/okx";

export interface OKXToken {
  decimals: string;
  tokenContractAddress: string;
  tokenLogoUrl: string;
  tokenName: string;
  tokenSymbol: string;
}

/**
 * Get all tokens available on a chain from OKX DEX API
 * @param chainIndex - Chain index (e.g., "5000" for Mantle mainnet)
 * @returns Array of tokens with decimals, address, name, symbol, logo
 */
export async function getTokens(chainIndex: string): Promise<OKXToken[]> {
  try {
    const path = "dex/aggregator/all-tokens";
    const url = `${baseUrl}${path}`;

    const params = { chainIndex };

    const timestamp = new Date().toISOString();
    const requestPath = `/api/v6/${path}`;
    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await axios.get(url, { params, headers });

    if (response.data.code === "0") {
      return response.data.data;
    } else {
      throw new Error(`API Error: ${response.data.msg || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Failed to get tokens:", (error as Error).message);
    throw error;
  }
}

/**
 * Get token decimals by contract address
 * @param chainIndex - Chain index
 * @param tokenAddress - Token contract address
 * @returns Token decimals as number, defaults to 18 if not found
 */
export async function getTokenDecimals(
  chainIndex: string,
  tokenAddress: string,
): Promise<number> {
  const tokens = await getTokens(chainIndex);
  const token = tokens.find(
    (t) => t.tokenContractAddress.toLowerCase() === tokenAddress.toLowerCase(),
  );
  return token ? parseInt(token.decimals) : 18;
}
