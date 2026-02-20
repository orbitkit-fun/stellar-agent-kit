import {
  createWalletClient,
  http,
  publicActions,
  type Chain,
  type PublicActions,
  type Transport,
  type WalletClient,
} from "viem";
import {
  privateKeyToAccount,
  type Address,
  type PrivateKeyAccount,
} from "viem/accounts";
import { mantle, mantleSepoliaTestnet } from "viem/chains";
import { executeSwap, sendTransaction } from "./tools";
import { getSwapQuote } from "./tools/okx/getSwapQuote";
import { getTokens, type OKXToken } from "./utils/okx";
import { swapOnOpenOcean, getOpenOceanQuote } from "./tools/openocean";
import { getTokenList, type OpenOceanToken } from "./utils/openocean";
import { swapOnUniswap, getUniswapQuote } from "./tools/uniswap";
import { crossChainSwapViaSquid, getSquidRoute } from "./tools/squid";
import {
  lendleSupply,
  lendleWithdraw,
  lendleBorrow,
  lendleRepay,
  lendleGetPositions,
} from "./tools/lendle";
import { agniSwap } from "./tools/agni";
import { merchantMoeSwap } from "./tools/merchantmoe";
import { METH_TOKEN } from "./tools/meth";
import { methGetPosition, swapToMeth, swapFromMeth } from "./tools/meth-staking";
import {
  pikeperpsOpenLong,
  pikeperpsOpenShort,
  pikeperpsClosePosition,
  pikeperpsGetPositions,
  pikeperpsGetMarketData,
} from "./tools/pikeperps";
import {
  pythGetPrice,
  pythGetEmaPrice,
  pythGetTokenPrice,
  pythGetMultiplePrices,
  pythGetSupportedPriceFeeds,
  pythGetSupportedTokenAddresses,
  pythPriceFeedExists,
} from "./tools/pyth";
import {
  deployToken,
  deployStandardToken,
  deployRWAToken,
  getTokenInfo,
  getTokenBalance,
  transferToken,
} from "./tools/token-launchpad";
import {
  deployNFTCollection,
  deployNFTCollectionWithPreset,
  mintNFT,
  batchMintNFT,
  getNFTCollectionInfo,
  getNFTTokenInfo,
  getNFTBalance,
  isNFTOwner,
  transferNFT,
  safeTransferNFT,
  approveNFT,
  setApprovalForAllNFT,
} from "./tools/nft-launchpad";
import type { TokenType } from "./constants/token-launchpad";
import type { NFTCollectionConfig } from "./constants/nft-launchpad";
import { initializePlatform, type ProjectConfig } from "./utils/x402";
import { getUserAccountData } from "./utils/lendle";
import { erc7811Actions, type Erc7811Actions } from "viem/experimental";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount> &
    PublicActions &
    Erc7811Actions;
  public chain: "testnet" | "mainnet";
  public demo: boolean;
  public projectConfig?: ProjectConfig;

  constructor(privateKey: Address, chain: "mainnet" | "testnet" | "testnet-demo") {
    this.account = privateKeyToAccount(privateKey);
    this.demo = chain === "testnet-demo";
    this.chain = chain === "testnet-demo" ? "testnet" : chain;
    this.client = createWalletClient({
      chain: this.chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    })
      .extend(publicActions)
      .extend(erc7811Actions());
  }

  /**
   * Initialize the agent with platform validation
   *
   * Validates APP_ID with the platform API.
   * Must be called after creating the agent instance.
   *
   * @returns The initialized agent instance
   * @throws Error if APP_ID is not set or validation fails
   *
   * @example
   * ```typescript
   * const agent = new MNTAgentKit(privateKey, "mainnet");
   * await agent.initialize(); // Validates APP_ID
   * ```
   */
  async initialize(): Promise<MNTAgentKit> {
    this.projectConfig = await initializePlatform();
    return this;
  }

  async sendTransaction(to: Address, amount: string) {
    return await sendTransaction(this, to, amount);
  }

  // OKX DEX Aggregator
  async getSwapQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    return await getSwapQuote(
      this,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippagePercentage,
    );
  }

  async getTokens(): Promise<OKXToken[]> {
    const chainIndex = this.chain === "mainnet" ? "5000" : "5003";
    return await getTokens(chainIndex);
  }

  async executeSwap(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    return await executeSwap(
      this,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippagePercentage,
    );
  }

  // OpenOcean DEX Aggregator
  async getOpenOceanQuote(
    fromToken: Address,
    toToken: Address,
    amount: string,
  ) {
    return await getOpenOceanQuote(this, fromToken, toToken, amount);
  }

  async swapOnOpenOcean(
    fromToken: Address,
    toToken: Address,
    amount: string,
    slippage: number = 0.5,
  ) {
    return await swapOnOpenOcean(
      this,
      fromToken,
      toToken,
      amount,
      slippage.toString(),
    );
  }

  async getOpenOceanTokens(): Promise<OpenOceanToken[]> {
    return await getTokenList(this.chain);
  }

  // Uniswap V3 DEX
  async getUniswapQuote(fromToken: Address, toToken: Address, amount: string) {
    return await getUniswapQuote(this, fromToken, toToken, amount);
  }

  async swapOnUniswap(
    fromToken: Address,
    toToken: Address,
    amount: string,
    slippage: number = 0.5,
  ) {
    return await swapOnUniswap(
      this,
      fromToken,
      toToken,
      amount,
      slippage.toString(),
    );
  }

  // Lendle Lending Protocol
  async lendleSupply(tokenAddress: Address, amount: string) {
    return await lendleSupply(this, tokenAddress, amount);
  }

  async lendleWithdraw(tokenAddress: Address, amount: string, to?: Address) {
    return await lendleWithdraw(this, tokenAddress, amount, to);
  }

  async lendleBorrow(
    tokenAddress: Address,
    amount: string,
    interestRateMode: 1 | 2 = 2,
    onBehalfOf?: Address,
  ) {
    return await lendleBorrow(
      this,
      tokenAddress,
      amount,
      interestRateMode,
      onBehalfOf,
    );
  }

  async lendleRepay(
    tokenAddress: Address,
    amount: string,
    rateMode: 1 | 2 = 2,
    onBehalfOf?: Address,
  ) {
    return await lendleRepay(this, tokenAddress, amount, rateMode, onBehalfOf);
  }

  /**
   * Get user account data from Lendle LendingPool
   * Returns overall position including total collateral, debt, and health factor
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns User account data with collateral, debt, available borrows, and health factor
   */
  async lendleGetUserAccountData(userAddress?: Address) {
    return await getUserAccountData(this, userAddress);
  }

  /**
   * Get all Lendle positions for a user (per-token breakdown)
   * Returns detailed supply and borrow amounts for each asset
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns Array of positions with supply/borrow amounts per asset
   */
  async lendleGetPositions(userAddress?: Address) {
    return await lendleGetPositions(this, userAddress);
  }

  // Agni Finance DEX (#1 on Mantle)
  async agniSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string,
    slippagePercent: number = 0.5,
    feeTier?: number,
  ) {
    return await agniSwap(
      this,
      tokenIn,
      tokenOut,
      amountIn,
      slippagePercent,
      feeTier,
    );
  }

  // Merchant Moe DEX (#2 on Mantle)
  async merchantMoeSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string,
    slippagePercent: number = 0.5,
    binStep?: number,
  ) {
    return await merchantMoeSwap(
      this,
      tokenIn,
      tokenOut,
      amountIn,
      slippagePercent,
      binStep,
    );
  }

  // mETH Protocol - Liquid Staking Token
  getMethTokenAddress() {
    if (this.demo) {
      return METH_TOKEN.mainnet;
    }
    return METH_TOKEN[this.chain];
  }

  /**
   * Get mETH staking position for a user
   * Returns mETH balance and WETH balance for comparison
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns mETH position with balances
   */
  async methGetPosition(userAddress?: Address) {
    return await methGetPosition(this, userAddress);
  }

  /**
   * Swap WETH to mETH using DEX aggregator
   * @param amount - Amount of WETH to swap (in wei as string)
   * @param slippage - Slippage tolerance percentage (default 0.5%)
   * @returns Transaction hash
   */
  async swapToMeth(amount: string, slippage: number = 0.5) {
    return await swapToMeth(this, amount, slippage);
  }

  /**
   * Swap mETH to WETH using DEX aggregator
   * @param amount - Amount of mETH to swap (in wei as string)
   * @param slippage - Slippage tolerance percentage (default 0.5%)
   * @returns Transaction hash
   */
  async swapFromMeth(amount: string, slippage: number = 0.5) {
    return await swapFromMeth(this, amount, slippage);
  }

  // Squid Router Cross-chain
  async getSquidRoute(
    fromToken: Address,
    toToken: Address,
    fromChain: number,
    toChain: number,
    amount: string,
    slippage: number = 1,
  ) {
    return await getSquidRoute(
      this,
      fromToken,
      toToken,
      fromChain,
      toChain,
      amount,
      slippage,
    );
  }

  async crossChainSwapViaSquid(
    fromToken: Address,
    toToken: Address,
    fromChain: number,
    toChain: number,
    amount: string,
    slippage: number = 1,
  ) {
    return await crossChainSwapViaSquid(
      this,
      fromToken,
      toToken,
      fromChain,
      toChain,
      amount,
      slippage,
    );
  }

  // PikePerps - Perpetual Trading
  /**
   * Open a long position on PikePerps
   * @param tokenAddress - Token to trade (meme token address)
   * @param margin - Margin amount in wei (as string)
   * @param leverage - Leverage multiplier (1-100, default 10)
   * @returns Position ID and transaction hash
   */
  async pikeperpsOpenLong(
    tokenAddress: Address,
    margin: string,
    leverage: number = 10,
  ) {
    return await pikeperpsOpenLong(this, tokenAddress, margin, leverage);
  }

  /**
   * Open a short position on PikePerps
   * @param tokenAddress - Token to trade (meme token address)
   * @param margin - Margin amount in wei (as string)
   * @param leverage - Leverage multiplier (1-100, default 10)
   * @returns Position ID and transaction hash
   */
  async pikeperpsOpenShort(
    tokenAddress: Address,
    margin: string,
    leverage: number = 10,
  ) {
    return await pikeperpsOpenShort(this, tokenAddress, margin, leverage);
  }

  /**
   * Close an existing position on PikePerps
   * @param positionId - Position ID to close
   * @returns Transaction hash
   */
  async pikeperpsClosePosition(positionId: bigint) {
    return await pikeperpsClosePosition(this, positionId);
  }

  /**
   * Get all positions for a user on PikePerps
   * Returns detailed position data including PnL and liquidation prices
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns Array of positions with PnL and liquidation data
   */
  async pikeperpsGetPositions(userAddress?: Address) {
    return await pikeperpsGetPositions(this, userAddress);
  }

  /**
   * Get market data for a token on PikePerps
   * Returns current price and recent trades
   * @param tokenAddress - Token address to get market data for
   * @param limit - Maximum number of recent trades to return (default 20)
   * @returns Market data with price and recent trades
   */
  async pikeperpsGetMarketData(tokenAddress: Address, limit: number = 20) {
    return await pikeperpsGetMarketData(this, tokenAddress, limit);
  }

  // ===== Pyth Network Price Feeds =====

  /**
   * Get real-time price from Pyth Network
   * Accepts token address, pair name, or price feed ID
   * @param input - Token address (e.g., "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2" for USDC),
   *                pair name (e.g., "ETH/USD"), or price feed ID (hex string)
   * @returns Price data with formatted price
   * @example
   * // Using pair name
   * await agent.pythGetPrice("ETH/USD");
   * // Using token address (USDC on Mantle)
   * await agent.pythGetPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");
   */
  async pythGetPrice(input: string) {
    return await pythGetPrice(this, input);
  }

  /**
   * Get EMA (Exponential Moving Average) price from Pyth
   * Accepts token address, pair name, or price feed ID
   * @param input - Token address, pair name, or price feed ID
   * @returns EMA price data
   */
  async pythGetEmaPrice(input: string) {
    return await pythGetEmaPrice(this, input);
  }

  /**
   * Get price for a token by its contract address
   * Pass any supported token address and get the USD price with full details
   * @param tokenAddress - Token contract address on Mantle
   * @returns Token price details including symbol, USD price, and timestamp
   * @example
   * const price = await agent.pythGetTokenPrice("0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2");
   * // Returns: {
   * //   tokenAddress: "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2",
   * //   tokenSymbol: "USDC",
   * //   pair: "USDC/USD",
   * //   priceUsd: "1.00",
   * //   lastUpdated: "2024-01-08T12:00:00.000Z"
   * // }
   */
  async pythGetTokenPrice(tokenAddress: string) {
    return await pythGetTokenPrice(this, tokenAddress);
  }

  /**
   * Get multiple prices from Pyth in a single call
   * Accepts token addresses, pair names, or price feed IDs
   * @param inputs - Array of token addresses, pair names, or price feed IDs
   * @returns Array of price responses
   * @example
   * await agent.pythGetMultiplePrices([
   *   "ETH/USD",                                           // pair name
   *   "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2",       // USDC address
   *   "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",       // mETH address
   * ]);
   */
  async pythGetMultiplePrices(inputs: string[]) {
    return await pythGetMultiplePrices(this, inputs);
  }

  /**
   * Get all supported Pyth price feed IDs
   * @returns Object mapping pair names to price feed IDs
   */
  pythGetSupportedPriceFeeds() {
    return pythGetSupportedPriceFeeds();
  }

  /**
   * Get all supported token addresses for Pyth price lookups on Mantle
   * @returns Object mapping token addresses to their pair names
   * @example
   * const addresses = agent.pythGetSupportedTokenAddresses();
   * // Returns: { "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2": "USDC/USD", ... }
   */
  pythGetSupportedTokenAddresses() {
    return pythGetSupportedTokenAddresses();
  }

  /**
   * Check if a price feed exists on Pyth
   * Accepts token address, pair name, or price feed ID
   * @param input - Token address, pair name, or price feed ID
   * @returns Boolean indicating if feed exists
   */
  async pythPriceFeedExists(input: string) {
    return await pythPriceFeedExists(this, input);
  }

  // ===== Token Launchpad =====

  /**
   * Deploy a new token (ERC20 or RWA) - supply minted to your address
   * @param name - Token name
   * @param symbol - Token symbol
   * @param supply - Total supply (human readable, e.g., "1000000")
   * @param tokenType - "standard" or "rwa"
   * @param assetType - For RWA: asset category
   * @param assetId - For RWA: external asset ID
   */
  async deployToken(
    name: string,
    symbol: string,
    supply: string,
    tokenType: TokenType = "standard",
    assetType?: string,
    assetId?: string,
  ) {
    return await deployToken(this, name, symbol, supply, tokenType, assetType, assetId);
  }

  /**
   * Deploy a standard ERC20 token
   * @param name - Token name
   * @param symbol - Token symbol
   * @param supply - Total supply (e.g., "1000000" for 1M tokens)
   */
  async deployStandardToken(name: string, symbol: string, supply: string) {
    return await deployStandardToken(this, name, symbol, supply);
  }

  /**
   * Deploy an RWA (Real World Asset) token
   * @param name - Token name (e.g., "Manhattan Property Token")
   * @param symbol - Token symbol (e.g., "MPT")
   * @param supply - Total supply for fractional ownership
   * @param assetType - Asset category: "Real Estate", "Commodities", "Securities", "Art"
   * @param assetId - External reference ID for the underlying asset
   */
  async deployRWAToken(
    name: string,
    symbol: string,
    supply: string,
    assetType: string,
    assetId?: string,
  ) {
    return await deployRWAToken(this, name, symbol, supply, assetType, assetId);
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenAddress: Address, holder?: Address) {
    return await getTokenInfo(this, tokenAddress, holder);
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: Address, holder?: Address) {
    return await getTokenBalance(this, tokenAddress, holder);
  }

  /**
   * Transfer tokens
   */
  async transferToken(tokenAddress: Address, to: Address, amount: string) {
    return await transferToken(this, tokenAddress, to, amount);
  }

  // ===== NFT Launchpad =====

  /**
   * Deploy a new ERC721 NFT collection on Mantle Network
   * @param config - Collection configuration (name, symbol, baseURI, maxSupply)
   * @returns Collection deployment result with contract address
   */
  async deployNFTCollection(config: NFTCollectionConfig) {
    return await deployNFTCollection(this, config);
  }

  /**
   * Deploy an NFT collection with preset configurations
   * @param preset - Preset type: "pfp" (10000), "art" (1000), "membership" (100), "unlimited"
   * @param name - Collection name
   * @param symbol - Collection symbol
   * @param baseURI - Base URI for metadata
   * @returns Collection deployment result
   */
  async deployNFTCollectionWithPreset(
    preset: "pfp" | "art" | "membership" | "unlimited",
    name: string,
    symbol: string,
    baseURI: string,
  ) {
    return await deployNFTCollectionWithPreset(
      this,
      preset,
      name,
      symbol,
      baseURI,
    );
  }

  /**
   * Mint a single NFT from a collection
   * @param collectionAddress - NFT collection contract address
   * @param to - Recipient address (defaults to agent address)
   * @returns Mint result with token ID
   */
  async mintNFT(collectionAddress: Address, to?: Address) {
    return await mintNFT(this, collectionAddress, to);
  }

  /**
   * Batch mint multiple NFTs from a collection
   * @param collectionAddress - NFT collection contract address
   * @param to - Recipient address
   * @param quantity - Number of NFTs to mint
   * @returns Mint result with starting token ID
   */
  async batchMintNFT(collectionAddress: Address, to: Address, quantity: number) {
    return await batchMintNFT(this, collectionAddress, to, quantity);
  }

  /**
   * Get information about an NFT collection
   * @param collectionAddress - NFT collection contract address
   * @param holderAddress - Optional address to get balance for
   * @returns Collection information
   */
  async getNFTCollectionInfo(
    collectionAddress: Address,
    holderAddress?: Address,
  ) {
    return await getNFTCollectionInfo(this, collectionAddress, holderAddress);
  }

  /**
   * Get information about a specific NFT token
   * @param collectionAddress - NFT collection contract address
   * @param tokenId - Token ID
   * @returns Token information
   */
  async getNFTTokenInfo(collectionAddress: Address, tokenId: string) {
    return await getNFTTokenInfo(this, collectionAddress, tokenId);
  }

  /**
   * Get NFT balance for an address
   * @param collectionAddress - NFT collection contract address
   * @param holderAddress - Address to check (defaults to agent address)
   * @returns Balance as string
   */
  async getNFTBalance(collectionAddress: Address, holderAddress?: Address) {
    return await getNFTBalance(this, collectionAddress, holderAddress);
  }

  /**
   * Check if an address owns a specific NFT
   * @param collectionAddress - NFT collection contract address
   * @param tokenId - Token ID to check
   * @param ownerAddress - Address to verify ownership
   * @returns Boolean indicating ownership
   */
  async isNFTOwner(
    collectionAddress: Address,
    tokenId: string,
    ownerAddress?: Address,
  ) {
    return await isNFTOwner(this, collectionAddress, tokenId, ownerAddress);
  }

  /**
   * Transfer an NFT to another address
   * @param collectionAddress - NFT collection contract address
   * @param to - Recipient address
   * @param tokenId - Token ID to transfer
   * @returns Transaction hash
   */
  async transferNFT(collectionAddress: Address, to: Address, tokenId: string) {
    return await transferNFT(this, collectionAddress, to, tokenId);
  }

  /**
   * Safe transfer an NFT (checks if recipient can receive)
   * @param collectionAddress - NFT collection contract address
   * @param to - Recipient address
   * @param tokenId - Token ID to transfer
   * @returns Transaction hash
   */
  async safeTransferNFT(
    collectionAddress: Address,
    to: Address,
    tokenId: string,
  ) {
    return await safeTransferNFT(this, collectionAddress, to, tokenId);
  }

  /**
   * Approve an address to transfer a specific NFT
   * @param collectionAddress - NFT collection contract address
   * @param approved - Address to approve
   * @param tokenId - Token ID to approve
   * @returns Transaction hash
   */
  async approveNFT(
    collectionAddress: Address,
    approved: Address,
    tokenId: string,
  ) {
    return await approveNFT(this, collectionAddress, approved, tokenId);
  }

  /**
   * Set approval for all NFTs in a collection
   * @param collectionAddress - NFT collection contract address
   * @param operator - Operator address
   * @param approved - Whether to approve or revoke
   * @returns Transaction hash
   */
  async setApprovalForAllNFT(
    collectionAddress: Address,
    operator: Address,
    approved: boolean,
  ) {
    return await setApprovalForAllNFT(this, collectionAddress, operator, approved);
  }
}
