import axios from "axios";
import { OPENOCEAN_BASE_URL, OPENOCEAN_CHAIN } from "../../constants/openocean";
import { getHeaders } from "../../helpers/openocean";

export interface OpenOceanToken {
  id: number;
  code: string;
  name: string;
  address: string;
  decimals: number;
  symbol: string;
  icon: string;
  chain: string;
  usd: string;
}

let tokenCache: { tokens: OpenOceanToken[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get list of supported tokens from OpenOcean API
 * @param chain - Chain identifier ("mainnet" | "testnet")
 * @returns Array of tokens with decimals, address, symbol, etc.
 */
export async function getTokenList(
  chain: "mainnet" | "testnet",
): Promise<OpenOceanToken[]> {
  // Return cached tokens if valid
  if (tokenCache && Date.now() - tokenCache.timestamp < CACHE_TTL) {
    return tokenCache.tokens;
  }

  try {
    const chainName = OPENOCEAN_CHAIN[chain];
    const url = `${OPENOCEAN_BASE_URL}/${chainName}/tokenList`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    if (response.data.code === 200) {
      tokenCache = {
        tokens: response.data.data,
        timestamp: Date.now(),
      };
      return response.data.data;
    } else {
      throw new Error(
        `OpenOcean API Error: ${response.data.message || "Unknown error"}`,
      );
    }
  } catch (error) {
    console.error("Failed to get OpenOcean token list:", (error as Error).message);
    throw error;
  }
}

/**
 * Get token decimals by contract address
 * @param chain - Chain identifier
 * @param tokenAddress - Token contract address
 * @returns Token decimals, defaults to 18 if not found
 */
export async function getOpenOceanTokenDecimals(
  chain: "mainnet" | "testnet",
  tokenAddress: string,
): Promise<number> {
  const tokens = await getTokenList(chain);
  const token = tokens.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
  );
  return token ? token.decimals : 18;
}

/**
 * Find token by symbol
 * @param chain - Chain identifier
 * @param symbol - Token symbol (e.g., "USDT", "MNT")
 * @returns Token info or undefined
 */
export async function findTokenBySymbol(
  chain: "mainnet" | "testnet",
  symbol: string,
): Promise<OpenOceanToken | undefined> {
  const tokens = await getTokenList(chain);
  return tokens.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
  );
}
