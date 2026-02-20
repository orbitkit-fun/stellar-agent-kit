import { type Address, type Hex, encodeFunctionData } from "viem";
import type { MNTAgentKit } from "../../agent";
import { ERC721_ABI, type NFTMintResult } from "../../constants/nft-launchpad";
import { DEMO_TX_HASH } from "../../utils/demo/mockResponses";

/**
 * Mint a single NFT from a collection
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param to - Recipient address (defaults to agent address)
 * @returns Mint result with token ID
 */
export async function mintNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  to?: Address,
): Promise<NFTMintResult> {
  const recipient = to || agent.account.address;

  // Demo mode
  if (agent.demo) {
    return {
      txHash: DEMO_TX_HASH,
      tokenId: "1",
      collectionAddress,
      to: recipient,
    };
  }

  // Encode mint function call
  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "mint",
    args: [recipient],
  });

  // Send transaction
  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  // Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({ hash: txHash });

  // Parse Transfer event to get token ID
  let tokenId = "0";
  for (const log of receipt.logs) {
    // Transfer event topic
    if (
      log.topics[0] ===
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ) {
      // Token ID is the third topic (indexed)
      if (log.topics[3]) {
        tokenId = BigInt(log.topics[3]).toString();
      }
    }
  }

  return {
    txHash,
    tokenId,
    collectionAddress,
    to: recipient,
  };
}

/**
 * Batch mint multiple NFTs from a collection
 * @param agent - MNTAgentKit instance
 * @param collectionAddress - NFT collection contract address
 * @param to - Recipient address
 * @param quantity - Number of NFTs to mint
 * @returns Mint result with starting token ID
 */
export async function batchMintNFT(
  agent: MNTAgentKit,
  collectionAddress: Address,
  to: Address,
  quantity: number,
): Promise<{ txHash: Hex; startTokenId: string; quantity: number }> {
  // Demo mode
  if (agent.demo) {
    return {
      txHash: DEMO_TX_HASH,
      startTokenId: "1",
      quantity,
    };
  }

  // Encode batch mint function call
  const data = encodeFunctionData({
    abi: ERC721_ABI,
    functionName: "batchMint",
    args: [to, BigInt(quantity)],
  });

  // Send transaction
  const txHash = await agent.client.sendTransaction({
    to: collectionAddress,
    data,
  });

  // Wait for confirmation
  const receipt = await agent.client.waitForTransactionReceipt({ hash: txHash });

  // Parse first Transfer event to get starting token ID
  let startTokenId = "1";
  for (const log of receipt.logs) {
    if (
      log.topics[0] ===
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ) {
      if (log.topics[3]) {
        startTokenId = BigInt(log.topics[3]).toString();
        break; // Get only the first token ID
      }
    }
  }

  return {
    txHash,
    startTokenId,
    quantity,
  };
}
