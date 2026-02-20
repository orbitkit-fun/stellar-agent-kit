import { type Address, type Hex } from "viem";
import type { MNTAgentKit } from "../../agent";
import { SQUID_CHAIN_ID, NATIVE_TOKEN_ADDRESS } from "../../constants/squid";
import { approveToken } from "../../utils/common";
import { getRouteData } from "../../utils/squid";
import { createMockTxHash, createMockSquidRoute } from "../../utils/demo/mockResponses";

/**
 * Execute cross-chain swap via Squid Router
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param fromChain - Source chain ID (LayerZero chain ID)
 * @param toChain - Destination chain ID (LayerZero chain ID)
 * @param amount - Amount to swap (in smallest units)
 * @param slippage - Slippage tolerance percentage (default: 1%)
 * @returns Transaction hash
 */
export async function crossChainSwapViaSquid(
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  fromChain: number,
  toChain: number,
  amount: string,
  slippage: number = 1,
): Promise<Hex> {
  if (agent.demo) {
    return createMockTxHash();
  }

  // Get route data from Squid API
  const routeData = await getRouteData(
    fromToken,
    toToken,
    fromChain,
    toChain,
    amount,
    agent.account.address,
    slippage,
  );

  const transactionRequest = routeData.route.transactionRequest;

  // Approve token if not native
  if (
    fromToken.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase() &&
    transactionRequest.targetAddress
  ) {
    await approveToken(
      agent,
      fromToken,
      transactionRequest.targetAddress as Address,
      amount,
    );
  }

  // Send transaction
  const hash = await agent.client.sendTransaction({
    to: transactionRequest.targetAddress as Address,
    data: transactionRequest.data as Hex,
    value: BigInt(transactionRequest.value || "0"),
    gas: BigInt(transactionRequest.gasLimit || "0"),
  });

  // Wait for confirmation
  await agent.client.waitForTransactionReceipt({ hash });

  return hash;
}

/**
 * Get cross-chain swap route from Squid Router
 * @param agent - MNTAgentKit instance
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param fromChain - Source chain ID (LayerZero chain ID)
 * @param toChain - Destination chain ID (LayerZero chain ID)
 * @param amount - Amount to swap (in smallest units)
 * @param slippage - Slippage tolerance percentage (default: 1%)
 * @returns Route data including estimated output and fees
 */
export async function getSquidRoute(
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  fromChain: number,
  toChain: number,
  amount: string,
  slippage: number = 1,
) {
  if (agent.demo) {
    return createMockSquidRoute(amount);
  }

  return await getRouteData(
    fromToken,
    toToken,
    fromChain,
    toChain,
    amount,
    agent.account.address,
    slippage,
  );
}

