import { type Address } from "viem";
import type { MNTAgentKit } from "../../agent";
import {
  ERC721_ABI,
  type NFTCollectionInfo,
  type NFTTokenInfo,
} from "../../constants/nft-launchpad";

/**
 * Get information about an NFT collection
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param holderAddress - Optional address to get balance for
 * @returns Collection information
 */
export async function getNFTCollectionInfo(
  agent: MNTAgentKit,
  collectionAddress: Address,
  holderAddress?: Address,
): Promise<NFTCollectionInfo> {
  // Demo mode
  if (agent.demo) {
    return {
      address: collectionAddress,
      name: "Demo NFT Collection",
      symbol: "DEMO",
      totalSupply: "100",
      balanceOf: holderAddress ? "5" : undefined,
    };
  }

  // Fetch collection info in parallel
  const [name, symbol, totalSupply] = await Promise.all([
    agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "name",
    }) as Promise<string>,
    agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "symbol",
    }) as Promise<string>,
    agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "totalSupply",
    }) as Promise<bigint>,
  ]);

  const result: NFTCollectionInfo = {
    address: collectionAddress,
    name,
    symbol,
    totalSupply: totalSupply.toString(),
  };

  // Get balance if holder address provided
  if (holderAddress) {
    const balance = (await agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "balanceOf",
      args: [holderAddress],
    })) as bigint;
    result.balanceOf = balance.toString();
  }

  return result;
}

/**
 * Get information about a specific NFT token
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param tokenId - Token ID
 * @returns Token information
 */
export async function getNFTTokenInfo(
  agent: MNTAgentKit,
  collectionAddress: Address,
  tokenId: string,
): Promise<NFTTokenInfo> {
  // Demo mode
  if (agent.demo) {
    return {
      collectionAddress,
      tokenId,
      owner: agent.account.address,
      tokenURI: `https://example.com/metadata/${tokenId}.json`,
    };
  }

  // Fetch token info in parallel
  const [owner, tokenURI] = await Promise.all([
    agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    }) as Promise<Address>,
    agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    }) as Promise<string>,
  ]);

  return {
    collectionAddress,
    tokenId,
    owner,
    tokenURI,
  };
}

/**
 * Get NFT balance for an address
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param holderAddress - Address to check balance for (defaults to agent address)
 * @returns Balance as string
 */
export async function getNFTBalance(
  agent: MNTAgentKit,
  collectionAddress: Address,
  holderAddress?: Address,
): Promise<string> {
  const address = holderAddress || agent.account.address;

  if (agent.demo) {
    return "5";
  }

  const balance = (await agent.client.readContract({
    address: collectionAddress,
    abi: ERC721_ABI,
    functionName: "balanceOf",
    args: [address],
  })) as bigint;

  return balance.toString();
}

/**
 * Check if an address owns a specific NFT
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param tokenId - Token ID to check
 * @param ownerAddress - Address to verify ownership
 * @returns Boolean indicating ownership
 */
export async function isNFTOwner(
  agent: MNTAgentKit,
  collectionAddress: Address,
  tokenId: string,
  ownerAddress?: Address,
): Promise<boolean> {
  const address = ownerAddress || agent.account.address;

  if (agent.demo) {
    return true;
  }

  try {
    const owner = (await agent.client.readContract({
      address: collectionAddress,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    })) as Address;

    return owner.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}
