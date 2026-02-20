/**
 * Mantle Network Information Resources
 */
export const MANTLE_RESOURCES = {
    "mantle://network/overview": {
        description: "Overview of Mantle Network",
        content: `# Mantle Network

Mantle is an Ethereum Layer 2 (L2) scaling solution using Optimistic Rollup technology with modular data availability.

## Key Features

- **Low Gas Fees**: Up to 95% cheaper than Ethereum mainnet
- **Fast Transactions**: ~2 second block time with quick finality
- **EVM Compatible**: Deploy existing Solidity contracts without changes
- **MNT Token**: Native gas token (not ETH like other L2s)
- **Modular Architecture**: Separate data availability layer for efficiency
- **EigenDA Integration**: Uses EigenLayer for data availability

## Network Details

### Mainnet
- Chain ID: 5000
- RPC URL: https://rpc.mantle.xyz
- WebSocket: wss://ws.mantle.xyz
- Block Explorer: https://mantlescan.xyz
- Native Token: MNT
- Block Time: ~2 seconds

### Testnet (Sepolia)
- Chain ID: 5003
- RPC URL: https://rpc.sepolia.mantle.xyz
- Block Explorer: https://sepolia.mantlescan.xyz
- Native Token: MNT (testnet)

## Alternative RPC Endpoints

- Primary: https://rpc.mantle.xyz
- Ankr: https://rpc.ankr.com/mantle
- PublicNode: https://mantle-rpc.publicnode.com
- 1RPC: https://1rpc.io/mantle

## LayerZero Integration

Mantle LayerZero Chain ID: 181 (for cross-chain operations)

## Wormhole Integration

Mantle Wormhole Chain ID: 36
`,
    },
    "mantle://network/mnt-token": {
        description: "MNT token details and tokenomics",
        content: `# MNT Token

MNT is the native token of Mantle Network, used for gas fees and governance.

## Token Details

- **Name**: Mantle
- **Symbol**: MNT
- **Decimals**: 18
- **Total Supply**: 6.2 billion MNT
- **Contract (L1)**: \`0x3c3a81e81dc49A522A592e7622A7E711c06bf354\`
- **Wrapped MNT (L2)**: \`0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8\`

## Use Cases

1. **Gas Fees**: Pay for transactions on Mantle Network
2. **Governance**: Vote on Mantle proposals
3. **Staking**: Stake for network security (future)
4. **DeFi**: Use as collateral, liquidity, trading

## Token Distribution

- Treasury: 49%
- Community/Ecosystem: 25%
- Core Contributors: 17%
- Investors: 9%

## Governance

MNT holders can participate in governance through:
- Mantle Governance Portal
- Snapshot voting
- On-chain proposals

## Getting MNT

1. **Bridge from Ethereum**: Use Mantle Bridge
2. **CEX**: Bybit, OKX, Gate.io, KuCoin
3. **DEX on Mantle**: Agni, Merchant Moe
`,
    },
    "mantle://network/bridge": {
        description: "Mantle bridge and cross-chain transfers",
        content: `# Mantle Bridge

## Official Bridge

**URL**: https://bridge.mantle.xyz

The official Mantle Bridge allows transfers between Ethereum and Mantle.

### Supported Assets

- ETH <-> WETH
- MNT (L1) <-> MNT (L2)
- USDC
- USDT
- WBTC
- And more ERC20 tokens

### Bridge Times

- **L1 to L2 (Deposit)**: ~10-20 minutes
- **L2 to L1 (Withdrawal)**: ~7 days (challenge period)

### Fast Withdrawal Options

For faster L2 to L1 withdrawals, use third-party bridges:
- Orbiter Finance
- Stargate
- Across Protocol
- Squid Router

## Third-Party Bridges

### Orbiter Finance
- URL: https://orbiter.finance
- Fast cross-rollup transfers
- Supports Mantle <-> other L2s

### Stargate (LayerZero)
- URL: https://stargate.finance
- Cross-chain liquidity protocol
- Uses LayerZero messaging

### Squid Router (Axelar)
- URL: https://squidrouter.com
- Cross-chain swaps
- Uses Axelar network

### Across Protocol
- URL: https://across.to
- Fast bridge with optimistic verification
- Competitive fees

## Bridge Contract Addresses

| Contract | Address |
|----------|---------|
| L1 Standard Bridge | \`0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012\` |
| L2 Standard Bridge | \`0x4200000000000000000000000000000000000010\` |
`,
    },
    "mantle://network/contracts": {
        description: "DeFi protocol contract addresses on Mantle",
        content: `# Contract Addresses

All addresses are for Mantle Mainnet (Chain ID 5000).

## Core Protocol Contracts

| Contract | Address |
|----------|---------|
| L2 Cross Domain Messenger | \`0x4200000000000000000000000000000000000007\` |
| L2 Standard Bridge | \`0x4200000000000000000000000000000000000010\` |
| L2 To L1 Message Passer | \`0x4200000000000000000000000000000000000016\` |
| Gas Price Oracle | \`0x420000000000000000000000000000000000000F\` |

## Lendle Protocol (Lending)

| Contract | Address |
|----------|---------|
| LendingPool | \`0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3\` |
| DataProvider | \`0xD0E0b5e99c8a36f4c5234cd1E90CFc5C2Bb58A69\` |
| Oracle | \`0x870c9692Ab04944C86ec6FEeF63F261226506EfC\` |
| lTokens | Check Lendle docs for specific asset lTokens |

## Agni Finance (DEX)

| Contract | Address |
|----------|---------|
| Factory | \`0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035\` |
| SwapRouter | \`0x319B69888b0d11cEC22caA5034e25FfFBDc88421\` |
| QuoterV2 | \`0xc4aaDc921E1cdb66c5300Bc158a313292923C0cb\` |
| NonfungiblePositionManager | \`0x9C9e335A3BC0EF6F66F44390c383D0bB7a0A34f0\` |

## Merchant Moe (DEX)

| Contract | Address |
|----------|---------|
| LBRouter | \`0x013e138EF6008ae5FDFDE29700e3f2Bc61d21E3a\` |
| LBFactory | \`0xa6630671775c4EA2743840F9A5016dCf2A104054\` |
| LBQuoter | \`0xFa1ec885c522Ee2c06aFCfBC66E88a88ca09EEED\` |

## Uniswap V3

| Contract | Address |
|----------|---------|
| SwapRouter | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| SwapRouter02 | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| QuoterV2 | \`0x61fFE014bA17989E743c5F6cB21bF9697530B21e\` |
| Factory | \`0x0d922Fb1Bc191F64970ac40376643808b4B74Df9\` |
| NonfungiblePositionManager | \`0xE592427A0AEce92De3Edee1F18E0157C05861564\` |

## mETH Protocol

| Contract | Address |
|----------|---------|
| mETH Token | \`0xcDA86A272531e8640cD7F1a92c01839911B90bb0\` |
| Staking Contract | Check mETH docs |

## Pendle Finance

| Contract | Address |
|----------|---------|
| Router | \`0x888888888889758F76e7103c6CbF23ABbF58F946\` |
| RouterStatic | \`0x263833d47eA3fA4a30f269323aba6a107f9eB14C\` |

## INIT Capital

| Contract | Address |
|----------|---------|
| InitCore | Check INIT docs |

Verify all addresses on [Mantlescan](https://mantlescan.xyz).
`,
    },
    "mantle://network/tokens": {
        description: "Common tokens on Mantle Network",
        content: `# Tokens on Mantle

## Native Token

**MNT** - Mantle's native gas token
- Native Address: \`0x0000000000000000000000000000000000000000\`
- Wrapped MNT (WMNT): \`0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8\`
- Decimals: 18

## Stablecoins

**USDC** (Bridged)
- Address: \`0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9\`
- Decimals: 6

**USDT** (Bridged)
- Address: \`0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE\`
- Decimals: 6

**USDe** (Ethena)
- Address: \`0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34\`
- Decimals: 18

**FDUSD**
- Address: \`0xC96dE26018A54D51c097160568752c4E3BD6C364\`
- Decimals: 18

## ETH Variants

**WETH** (Wrapped Ether)
- Address: \`0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111\`
- Decimals: 18

**mETH** (Mantle Staked ETH)
- Address: \`0xcDA86A272531e8640cD7F1a92c01839911B90bb0\`
- Decimals: 18
- Liquid staking token for ETH

**cmETH** (Compounding mETH)
- Address: Check mETH protocol
- Auto-compounding version of mETH

## Other Major Tokens

**WBTC** (Wrapped Bitcoin)
- Address: \`0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2\`
- Decimals: 8

**COOK** (Mantle Ecosystem)
- Address: \`0x6a6AA13393B7d1100c00a57c76c39e8B6C835041\`
- Decimals: 18

**MOE** (Merchant Moe)
- Address: \`0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9\`
- Decimals: 18

**PUFF** (Puff Ecosystem)
- Address: Check CoinGecko for latest

## Yield-Bearing Tokens

**lUSDC** (Lendle USDC)
- Lendle deposit receipt token
- Check Lendle DataProvider for address

**PT/YT Tokens** (Pendle)
- Principal and Yield tokens for various assets
- Check Pendle markets for addresses

## Token Decimals Quick Reference

| Token | Decimals |
|-------|----------|
| MNT, WMNT, WETH, mETH | 18 |
| USDC, USDT | 6 |
| WBTC | 8 |

## Token Operations Tips

1. Native MNT uses zero address \`0x0000...0000\`
2. Always approve ERC20 tokens before swapping
3. Check decimals before amount calculations
4. Use wrapped versions for DeFi protocols
`,
    },
    "mantle://network/ecosystem": {
        description: "Mantle ecosystem protocols and dApps",
        content: `# Mantle Ecosystem

## DEXs (Decentralized Exchanges)

### Agni Finance
- Type: Concentrated liquidity AMM (Uniswap V3 fork)
- URL: https://agni.finance
- Features: Multiple fee tiers, LP positions as NFTs
- TVL: Top DEX on Mantle

### Merchant Moe
- Type: Liquidity Book DEX (TraderJoe V2.1 fork)
- URL: https://merchantmoe.com
- Features: Zero slippage bins, dynamic fees
- Native Token: MOE

### FusionX
- Type: AMM DEX
- URL: https://fusionx.finance
- Features: Multi-chain, aggregation

### iZUMi Finance
- Type: Concentrated liquidity
- URL: https://izumi.finance

## Lending Protocols

### Lendle
- Type: Lending/Borrowing (Aave V2 fork)
- URL: https://lendle.xyz
- Features: Supply, borrow, flash loans
- Markets: USDC, USDT, WETH, mETH, MNT, WBTC

### INIT Capital
- Type: Liquidity Hook Protocol
- URL: https://init.capital
- Features: Composable positions, hooks

### Aurelius Finance
- Type: Lending protocol
- URL: https://aurelius.finance

## Liquid Staking

### mETH Protocol
- Type: Liquid staking for ETH
- URL: https://www.mantle-meth.xyz
- Token: mETH
- Features: Stake ETH, receive mETH, earn staking rewards

### Pendle Finance
- Type: Yield tokenization
- URL: https://pendle.finance
- Features: Trade future yield, fixed rates
- Markets: mETH, USDe, and more

## Perpetuals & Derivatives

### KTX Finance
- Type: Perpetual DEX
- URL: https://ktx.finance
- Features: Up to 50x leverage

### Ammos Finance
- Type: Perpetuals
- URL: https://ammos.finance

## NFT Marketplaces

### Mint Square
- Type: NFT marketplace
- URL: https://mintsquare.io

### tofuNFT
- Type: Multi-chain NFT marketplace
- URL: https://tofunft.com

## Yield Aggregators

### Beefy Finance
- Type: Yield optimizer
- URL: https://beefy.com
- Features: Auto-compounding vaults

### Yield Yak
- Type: Yield aggregator
- Supports Mantle strategies

## Infrastructure

### The Graph
- Subgraph indexing available for Mantle

### Chainlink
- Oracle services on Mantle
- Price feeds available

### Pyth Network
- High-frequency price oracles
- URL: https://pyth.network

## Gaming & Social

### Catizen
- Gaming ecosystem on Mantle

### Various GameFi projects
- Check Mantle ecosystem page
`,
    },
    "mantle://network/development": {
        description: "Development resources for Mantle",
        content: `# Mantle Development Resources

## Official Resources

- Documentation: https://docs.mantle.xyz/
- GitHub: https://github.com/mantlenetworkio
- Block Explorer: https://mantlescan.xyz/
- Testnet Explorer: https://sepolia.mantlescan.xyz/
- Bridge: https://bridge.mantle.xyz/
- Governance: https://governance.mantle.xyz/

## Mantle DevKit

- Dashboard: https://mantle-devkit.vercel.app
- Agent Kit SDK: \`npm install mantle-agent-kit-sdk\`
- x402 SDK: \`npm install x402-devkit\`
- MCP Server: \`npm install mantle-devkit-mcp\`

## Development Setup

### Connecting with Viem

\`\`\`typescript
import { createWalletClient, createPublicClient, http } from "viem";
import { mantle, mantleSepoliaTestnet } from "viem/chains";

// Public client for reading
const publicClient = createPublicClient({
  chain: mantle,
  transport: http("https://rpc.mantle.xyz"),
});

// Wallet client for transactions
const walletClient = createWalletClient({
  chain: mantle,
  transport: http("https://rpc.mantle.xyz"),
});
\`\`\`

### Connecting with Ethers v6

\`\`\`typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.mantle.xyz");
const wallet = new ethers.Wallet(privateKey, provider);
\`\`\`

### Hardhat Configuration

\`\`\`javascript
module.exports = {
  networks: {
    mantle: {
      url: "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts: [process.env.PRIVATE_KEY],
    },
    mantleTestnet: {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      mantle: process.env.MANTLESCAN_API_KEY,
    },
    customChains: [
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz",
        },
      },
    ],
  },
};
\`\`\`

### Foundry Configuration

\`\`\`toml
[rpc_endpoints]
mantle = "https://rpc.mantle.xyz"
mantle_testnet = "https://rpc.sepolia.mantle.xyz"

[etherscan]
mantle = { key = "\${MANTLESCAN_API_KEY}", url = "https://api.mantlescan.xyz/api" }
\`\`\`

## Contract Verification

### Using Hardhat

\`\`\`bash
npx hardhat verify --network mantle <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
\`\`\`

### Using Foundry

\`\`\`bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \\
  --chain-id 5000 \\
  --verifier-url https://api.mantlescan.xyz/api \\
  --etherscan-api-key $MANTLESCAN_API_KEY
\`\`\`

## Testnet Faucet

Get testnet MNT:
- Mantle Faucet: https://faucet.sepolia.mantle.xyz/
- Request in Mantle Discord

## API Keys

### Mantlescan API
- Sign up at https://mantlescan.xyz
- Get API key for contract verification and data queries
`,
    },
    "mantle://network/gas": {
        description: "Gas fees and optimization on Mantle",
        content: `# Gas on Mantle

## Gas Token

Unlike most L2s that use ETH, Mantle uses **MNT** as the native gas token.

## Current Gas Prices

Gas prices on Mantle are typically:
- Base fee: ~0.02-0.05 gwei
- Priority fee: ~0.001 gwei

Check current prices: https://mantlescan.xyz/gastracker

## Gas Estimation

\`\`\`typescript
// Using viem
const gasEstimate = await publicClient.estimateGas({
  account: address,
  to: recipientAddress,
  value: parseEther("1"),
});

// Using ethers
const gasEstimate = await provider.estimateGas({
  from: address,
  to: recipientAddress,
  value: parseEther("1"),
});
\`\`\`

## Transaction Costs

Typical transaction costs on Mantle:
- Simple transfer: ~0.0001 MNT
- Token swap: ~0.0005-0.002 MNT
- Contract deployment: ~0.01-0.1 MNT

## Gas Optimization Tips

1. **Batch Transactions**: Use multicall for multiple operations
2. **Efficient Data**: Minimize calldata size
3. **Storage Optimization**: Pack storage variables
4. **Use Events**: Instead of storage for historical data
5. **Avoid Loops**: Especially unbounded loops

## L1 Data Costs

Mantle uses modular data availability:
- Data posted to EigenDA, not Ethereum
- Significantly reduces L1 data costs
- Lower fees compared to traditional optimistic rollups

## Gas Price Oracle

Contract: \`0x420000000000000000000000000000000000000F\`

\`\`\`solidity
interface GasPriceOracle {
  function gasPrice() external view returns (uint256);
  function l1BaseFee() external view returns (uint256);
  function overhead() external view returns (uint256);
  function scalar() external view returns (uint256);
}
\`\`\`
`,
    },
    "mantle://network/security": {
        description: "Security considerations for Mantle development",
        content: `# Security on Mantle

## Network Security

### Optimistic Rollup Security
- 7-day challenge period for withdrawals
- Fraud proofs protect against invalid state transitions
- Inherits Ethereum's security guarantees

### Data Availability
- Uses EigenDA (EigenLayer)
- Separate DA layer for efficiency
- Data availability sampling

## Smart Contract Security

### Common Vulnerabilities to Avoid

1. **Reentrancy**
   - Use checks-effects-interactions pattern
   - Use ReentrancyGuard from OpenZeppelin

2. **Integer Overflow/Underflow**
   - Solidity 0.8+ has built-in checks
   - Use SafeMath for older versions

3. **Access Control**
   - Implement proper role-based access
   - Use OpenZeppelin's AccessControl

4. **Front-Running**
   - Use commit-reveal schemes
   - Implement slippage protection

5. **Oracle Manipulation**
   - Use time-weighted average prices (TWAP)
   - Multiple oracle sources

### Security Checklist

- [ ] Audit smart contracts before mainnet
- [ ] Use established libraries (OpenZeppelin)
- [ ] Implement emergency pause functionality
- [ ] Test thoroughly on testnet
- [ ] Set up monitoring and alerts
- [ ] Have incident response plan

## Auditors on Mantle

Many protocols on Mantle have been audited by:
- Trail of Bits
- OpenZeppelin
- Certik
- PeckShield
- Halborn

## Bug Bounties

Check individual protocol bug bounty programs on:
- Immunefi
- HackerOne
- Protocol-specific programs

## Safe Practices

1. **Test on Testnet First**: Always deploy to Sepolia testnet
2. **Verify Contracts**: Verify source on Mantlescan
3. **Use Multisig**: For admin functions
4. **Timelock**: For critical parameter changes
5. **Monitor**: Set up alerts for unusual activity
`,
    },
    "mantle://network/oracles": {
        description: "Oracle services available on Mantle",
        content: `# Oracles on Mantle

## Pyth Network

High-frequency, low-latency price feeds.

**Contract**: Check Pyth docs for Mantle address

\`\`\`typescript
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

const connection = new EvmPriceServiceConnection(
  "https://hermes.pyth.network"
);

const priceIds = [
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
];

const priceFeeds = await connection.getLatestPriceFeeds(priceIds);
\`\`\`

## Chainlink

Industry-standard price feeds.

**Price Feeds on Mantle**:
- ETH/USD
- BTC/USD
- MNT/USD
- And more

\`\`\`solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor(address feedAddress) {
        priceFeed = AggregatorV3Interface(feedAddress);
    }

    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}
\`\`\`

## API3

First-party oracles with dAPIs.

- URL: https://api3.org
- Mantle support available

## RedStone

Modular oracle design.

\`\`\`typescript
import { WrapperBuilder } from "@redstone-finance/evm-connector";

const wrappedContract = WrapperBuilder
  .wrap(contract)
  .usingDataService({
    dataServiceId: "redstone-main-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["ETH", "BTC"],
  });
\`\`\`

## TWAP Oracles

For DEX price feeds, use Time-Weighted Average Price:

\`\`\`typescript
// Uniswap V3 style TWAP
const slot0 = await poolContract.slot0();
const observations = await poolContract.observe([3600, 0]); // 1 hour TWAP

const tickCumulativesDelta = observations.tickCumulatives[1] - observations.tickCumulatives[0];
const arithmeticMeanTick = tickCumulativesDelta / 3600;
\`\`\`

## Best Practices

1. **Multiple Sources**: Don't rely on single oracle
2. **Staleness Checks**: Verify price freshness
3. **Deviation Checks**: Alert on large price movements
4. **Fallback Logic**: Handle oracle failures gracefully
`,
    },
};
//# sourceMappingURL=mantle.js.map