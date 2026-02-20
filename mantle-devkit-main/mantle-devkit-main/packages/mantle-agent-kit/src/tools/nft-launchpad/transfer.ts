import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { ERC721_ABI } from "../../constants/nft-launchpad";
import { DEMO_TX_HASH } from "../../utils/demo/mockResponses";

/**
 * Transfer an NFT to another address
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param to - Recipient address
 * @param tokenId - Token ID to transfer
 * @returns Transaction hash
 */
export async function transferNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  to: Address,
  tokenId: string,
): Promise<Hex> {
  if (agent.demo) {
    return DEMO_TX_HASH;
  }

  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "transferFrom",
    args: [agent.account.address, to, BigInt(tokenId)],
  });

  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

/**
 * Safe transfer an NFT (checks if recipient can receive)
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param to - Recipient address
 * @param tokenId - Token ID to transfer
 * @returns Transaction hash
 */
export async function safeTransferNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  to: Address,
  tokenId: string,
): Promise<Hex> {
  if (agent.demo) {
    return DEMO_TX_HASH;
  }

  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "safeTransferFrom",
    args: [agent.account.address, to, BigInt(tokenId)],
  });

  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

/**
 * Approve an address to transfer a specific NFT
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param approved - Address to approve
 * @param tokenId - Token ID to approve
 * @returns Transaction hash
 */
export async function approveNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  approved: Address,
  tokenId: string,
): Promise<Hex> {
  if (agent.demo) {
    return DEMO_TX_HASH;
  }

  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "approve",
    args: [approved, BigInt(tokenId)],
  });

  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

/**
 * Set approval for all NFTs in a collection
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param operator - Operator address
 * @param approved - Whether to approve or revoke
 * @returns Transaction hash
 */
export async function setApprovalForAllNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  operator: Address,
  approved: boolean,
): Promise<Hex> {
  if (agent.demo) {
    return DEMO_TX_HASH;
  }

  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "setApprovalForAll",
    args: [operator, approved],
  });

  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  await agent.client.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}
