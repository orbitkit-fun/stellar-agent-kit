import { encodeFunctionData, type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  QUOTER_V2_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  DEFAULT_POOL_FEE,
  WMNT_ADDRESS,
  NATIVE_TOKEN_ADDRESS,
} from "../../constants/uniswap";

// QuoterV2 ABI for quoteExactInputSingle
const quoterV2Abi = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// SwapRouter02 ABI for exactInputSingle
const swapRouterAbi = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export interface UniswapQuoteResult {
  amountOut: bigint;
  sqrtPriceX96After: bigint;
  gasEstimate: bigint;
}

export interface UniswapSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMinimum: string;
  recipient: string;
  fee?: number;
}

/**
 * Get token address, converting native token to WMNT
 */
function getTokenAddress(token: string): Address {
  if (token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    return WMNT_ADDRESS as Address;
  }
  return token as Address;
}

/**
 * Get swap quote from Uniswap V3
 * @param agent - MNTAgentKit instance
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in smallest units)
 * @param fee - Pool fee tier (default: 3000 = 0.3%)
 * @returns Quote result with expected output amount
 */
export async function getUniswapQuoteData(
  agent: MNTAgentKit,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  fee: number = DEFAULT_POOL_FEE,
): Promise<UniswapQuoteResult> {
  try {
    const result = await agent.client.simulateContract({
      address: QUOTER_V2_ADDRESS as Address,
      abi: quoterV2Abi,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: getTokenAddress(tokenIn),
          tokenOut: getTokenAddress(tokenOut),
          amountIn: BigInt(amountIn),
          fee: fee,
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    });

    const [amountOut, sqrtPriceX96After, , gasEstimate] = result.result;

    return {
      amountOut,
      sqrtPriceX96After,
      gasEstimate,
    };
  } catch (error) {
    console.error("Failed to get Uniswap quote:", error);
    throw error;
  }
}

/**
 * Build swap transaction calldata for Uniswap V3
 * @param params - Swap parameters
 * @param fee - Pool fee tier
 * @returns Encoded calldata for the swap
 */
export function buildSwapCalldata(
  params: UniswapSwapParams,
  fee: number = DEFAULT_POOL_FEE,
): `0x${string}` {
  return encodeFunctionData({
    abi: swapRouterAbi,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: getTokenAddress(params.tokenIn),
        tokenOut: getTokenAddress(params.tokenOut),
        fee: fee,
        recipient: params.recipient as Address,
        amountIn: BigInt(params.amountIn),
        amountOutMinimum: BigInt(params.amountOutMinimum),
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });
}

export { SWAP_ROUTER_ADDRESS, QUOTER_V2_ADDRESS, NATIVE_TOKEN_ADDRESS, WMNT_ADDRESS };
