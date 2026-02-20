import { type Address, getAddress } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  PROTOCOL_DATA_PROVIDER,
  PROTOCOL_DATA_PROVIDER_ABI,
  LENDLE_SUPPORTED_ASSETS,
} from "../../constants/lendle";

export interface LendlePosition {
  asset: Address;
  symbol: string;
  supplied: bigint;
  stableDebt: bigint;
  variableDebt: bigint;
  totalDebt: bigint;
  liquidityRate: bigint; // Supply APY (in ray, 1e27)
  stableBorrowRate: bigint;
  usageAsCollateralEnabled: boolean;
}

export interface LendlePositionsResult {
  positions: LendlePosition[];
  totalSupplied: bigint;
  totalDebt: bigint;
}

/**
 * Get all Lendle positions for a user
 * Returns per-token supply and borrow amounts
 * @param agent - MNTAgentKit instance
 * @param userAddress - User wallet address (optional, defaults to agent account)
 * @returns Array of positions with supply/borrow amounts per asset
 */
export async function lendleGetPositions(
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<LendlePositionsResult> {
  const dataProviderAddress = PROTOCOL_DATA_PROVIDER[agent.chain];
  const address = userAddress || agent.account.address;

  if (dataProviderAddress === "0x0000000000000000000000000000000000000000") {
    if (agent.demo) {
      return {
        positions: [
          {
            asset: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as Address, // WMNT
            symbol: "WMNT",
            supplied: BigInt("1000000000000000000"), // 1 WMNT
            stableDebt: 0n,
            variableDebt: BigInt("200000000000000000"), // 0.2 WMNT borrowed
            totalDebt: BigInt("200000000000000000"),
            liquidityRate: BigInt("25000000000000000000000000"), // ~2.5% APY (in ray)
            stableBorrowRate: 0n,
            usageAsCollateralEnabled: true,
          },
          {
            asset: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111" as Address, // WETH
            symbol: "WETH",
            supplied: BigInt("500000000000000000"), // 0.5 WETH
            stableDebt: 0n,
            variableDebt: 0n,
            totalDebt: 0n,
            liquidityRate: BigInt("30000000000000000000000000"), // ~3% APY
            stableBorrowRate: 0n,
            usageAsCollateralEnabled: true,
          },
        ],
        totalSupplied: BigInt("1500000000000000000"),
        totalDebt: BigInt("200000000000000000"),
      };
    }
    throw new Error(
      `Lendle ProtocolDataProvider not configured for ${agent.chain}. Only available on mainnet.`,
    );
  }

  // Get supported assets for the chain
  const supportedAssets = LENDLE_SUPPORTED_ASSETS[agent.chain];
  if (!supportedAssets || supportedAssets.length === 0) {
    throw new Error(`No supported assets configured for ${agent.chain}`);
  }

  const positions: LendlePosition[] = [];
  let totalSupplied = 0n;
  let totalDebt = 0n;

  // Query each asset's position
  for (const asset of supportedAssets) {
    try {
      // Normalize address to proper checksum format
      const assetAddress = getAddress(asset.address);
      const result = (await agent.client.readContract({
        address: dataProviderAddress,
        abi: PROTOCOL_DATA_PROVIDER_ABI,
        functionName: "getUserReserveData",
        args: [assetAddress, address],
      })) as readonly [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        number,
        boolean,
      ];

      const [
        currentATokenBalance,
        currentStableDebt,
        currentVariableDebt,
        _principalStableDebt,
        _scaledVariableDebt,
        stableBorrowRate,
        liquidityRate,
        _stableRateLastUpdated,
        usageAsCollateralEnabled,
      ] = result;

      // Only include positions with non-zero supply or debt
      if (
        currentATokenBalance > 0n ||
        currentStableDebt > 0n ||
        currentVariableDebt > 0n
      ) {
        const assetTotalDebt = currentStableDebt + currentVariableDebt;

        positions.push({
          asset: assetAddress,
          symbol: asset.symbol,
          supplied: currentATokenBalance,
          stableDebt: currentStableDebt,
          variableDebt: currentVariableDebt,
          totalDebt: assetTotalDebt,
          liquidityRate,
          stableBorrowRate,
          usageAsCollateralEnabled,
        });

        totalSupplied += currentATokenBalance;
        totalDebt += assetTotalDebt;
      }
    } catch (error) {
      // Skip assets that fail (might not be supported)
      console.warn(`Failed to get position for ${asset.symbol}:`, error);
    }
  }

  return {
    positions,
    totalSupplied,
    totalDebt,
  };
}
