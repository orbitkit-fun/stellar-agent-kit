import axios from "axios";
import { type Address } from "viem";
import { SQUID_BASE_URL, SQUID_CHAIN_ID, NATIVE_TOKEN_ADDRESS } from "../../constants/squid";
import { getHeaders } from "../../helpers/squid";

export interface SquidRoute {
  route: {
    estimate: {
      fromAmount: string;
      toAmount: string;
      toAmountMin: string;
      route: {
        actionType: string;
        chainType: string;
        data: {
          tokenIn: string;
          tokenOut: string;
          amountIn: string;
          amountOut: string;
          path: string[];
        };
      }[];
      estimatedRouteDuration: number;
      aggregatePriceImpact: string;
      feeCosts: {
        name: string;
        description: string;
        percentage: string;
        amount: string;
        amountUSD: string;
      }[];
      gasCosts: {
        type: string;
        amount: string;
        amountUSD: string;
        gasPrice: string;
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
        estimate: string;
      }[];
    };
    transactionRequest: {
      routeType: string;
      targetAddress: string;
      data: string;
      value: string;
      gasLimit: string;
      gasPrice: string;
      maxFeePerGas: string;
      maxPriorityFeePerGas: string;
    };
  };
}

/**
 * Get cross-chain swap route from Squid Router
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param fromChain - Source chain ID (LayerZero chain ID)
 * @param toChain - Destination chain ID (LayerZero chain ID)
 * @param amount - Amount to swap (in smallest units)
 * @param fromAddress - User's wallet address on source chain
 * @param slippage - Slippage tolerance (default: 1%)
 * @returns Route data including transaction request
 */
export async function getRouteData(
  fromToken: Address,
  toToken: Address,
  fromChain: number,
  toChain: number,
  amount: string,
  fromAddress: Address,
  slippage: number = 1,
): Promise<SquidRoute> {
  const params = {
    fromChain: fromChain.toString(),
    toChain: toChain.toString(),
    fromToken:
      fromToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
        ? "native"
        : fromToken,
    toToken:
      toToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
        ? "native"
        : toToken,
    fromAmount: amount,
    fromAddress,
    slippage: slippage.toString(),
    enableForecast: false,
  };

  const response = await axios.get<SquidRoute>(`${SQUID_BASE_URL}/route`, {
    params,
    headers: getHeaders(),
  });

  return response.data;
}

/**
 * Get transaction status from Squid Router
 * @param transactionHash - Transaction hash
 * @param fromChain - Source chain ID
 * @returns Transaction status
 */
export async function getTransactionStatus(
  transactionHash: string,
  fromChain: number,
): Promise<any> {
  const response = await axios.get(`${SQUID_BASE_URL}/status`, {
    params: {
      transactionHash,
      fromChain: fromChain.toString(),
    },
    headers: getHeaders(),
  });

  return response.data;
}

