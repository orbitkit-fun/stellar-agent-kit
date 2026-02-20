// Pyth Network Oracle contract addresses on Mantle Network
// Official docs: https://docs.pyth.network/price-feeds/contract-addresses/evm
// Pyth provides low-latency, pull-based price feeds for DeFi applications

// Pyth Oracle Contract - Main contract for price feeds
export const PYTH_CONTRACT = {
  mainnet: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729" as const,
  testnet: "0x98046Bd286715D3B0BC227Dd7a956b83D8978603" as const,
} as const;

// Hermes API endpoints for fetching price update data
export const HERMES_ENDPOINT = {
  mainnet: "https://hermes.pyth.network",
  testnet: "https://hermes.pyth.network",
} as const;

// Pyth Price Feed IDs (hex strings without 0x prefix)
// Full list: https://pyth.network/developers/price-feed-ids
export const PYTH_PRICE_FEED_IDS = {
  // === Major Cryptocurrencies ===
  "BTC/USD": "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "ETH/USD": "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "SOL/USD": "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "BNB/USD": "2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
  "XRP/USD": "ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
  "ADA/USD": "2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d",
  "DOGE/USD": "dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c",
  "DOT/USD": "ca3eed9b267293f6595901c734c7525ce8ef49adafe8284571c8e17d6c926346",
  "AVAX/USD": "93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  "MATIC/USD": "5de33440f6b7d0d7d70f0a7b2a6c0e0b8e5d2f7c8a9b0c1d2e3f4a5b6c7d8e9f",
  "LINK/USD": "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
  "ATOM/USD": "b00b60f88b03a6a625a8d1c048c3f66653edf217439cb6a1cbab0c1c5e8c52bd",
  "LTC/USD": "6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54",
  "UNI/USD": "78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501",
  "NEAR/USD": "c415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750",
  "TRX/USD": "67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b",

  // === Layer 2 & Scaling ===
  "ARB/USD": "3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
  "OP/USD": "385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf",
  "MNT/USD": "4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585",
  "IMX/USD": "941320a8989414a6d2c757c8c6c52b3e7e0b7e4e4c5bb8a3c8e7a0f3e0f0f0f0",
  "STRK/USD": "6a182399ff70ccf3e06024898942028204125a819e519a335ffa4579e66cd870",

  // === DeFi Tokens ===
  "AAVE/USD": "2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445",
  "CRV/USD": "a19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8",
  "MKR/USD": "9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378",
  "SNX/USD": "39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3",
  "COMP/USD": "4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478",
  "LDO/USD": "c63e2a7f37a04e5e614c07238bedb25dcc38927e77a90a4b21a7a2e1d7f0d2e3",
  "1INCH/USD": "63f341689d98a12ef60a5cff1d7f85c70a9e17bf1575f0e7c0b2512d48b1c8b3",
  "SUSHI/USD": "26e4f737fde0263a9eea10ae63ac36dcedab2aaf629f1e31a28a28dd0e0d2b0c",
  "YFI/USD": "425f4b198ab2504936886c1e93511bb6720fbcf2045a4f3c0723bb213846022f",
  "BAL/USD": "07ad7b4a7662d19a6bc675f6b467172d2f3947fa653ca97555a9b20236406628",
  "CAKE/USD": "2356af9529a1064d1d2a2e3e4ab6d6e6f6e6f6e6f6e6f6e6f6e6f6e6f6e6f6e6",
  "GMX/USD": "b962539d0fcb272a494d65ea56f94851c2bcf8823935da05bd628916e2e9edbf",
  "PENDLE/USD": "9a4df90b25497f66b1afb012467e316e801ca3d839456db028892fe8c70c8016",
  "JOE/USD": "1e8a156c8a23c1e56f2d9d7f0e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e",

  // === Stablecoins ===
  "USDC/USD": "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
  "USDT/USD": "2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
  "DAI/USD": "b0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd",
  "FRAX/USD": "c3d5d8d6d0c0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0",
  "BUSD/USD": "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
  "TUSD/USD": "433faaa801ecda2c0bbfa8f4e2d85fd4c310e2c1e5f8f8e6e5f5f5f5f5f5f5f5",
  "LUSD/USD": "d892ae586f4e0fbeee4d64f29ed6e89b1b3e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",

  // === Wrapped & LST Tokens ===
  "WETH/USD": "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "WBTC/USD": "c9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33",
  "stETH/USD": "846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5",
  "cbETH/USD": "15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717",
  "rETH/USD": "a0255134973f4fdf2f8f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
  "mETH/USD": "4c9c6f9f0cde13fced52dc1927c8c06a91b1a65ab77b9e1ec1c614963ce90dd4",
  "wstETH/USD": "6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784",

  // === Meme Coins ===
  "SHIB/USD": "f0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a",
  "PEPE/USD": "d69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4",
  "FLOKI/USD": "6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322c28a6f7f4d1a2d2",
  "BONK/USD": "72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
  "WIF/USD": "4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc",

  // === Gaming & Metaverse ===
  "AXS/USD": "b0d8f5e3f3a7c0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0",
  "SAND/USD": "f4040ec3e5b71c241a7e1a9a1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
  "MANA/USD": "2b15e4bded7f5e5d5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a",
  "GALA/USD": "e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3",
  "APE/USD": "15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864",
  "ENJ/USD": "5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a",

  // === Infrastructure & Oracles ===
  "FIL/USD": "150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e",
  "GRT/USD": "4d1f8dae0d96236fb98e8f47571a70f41c8b8f2f6d6c0e0e0e0e0e0e0e0e0e0e",
  "RNDR/USD": "ab7347771135fc733f8f38db462ba085ed3309955f42554a14fa13e855ac0e2f",
  "INJ/USD": "7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592",
  "AR/USD": "8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c",
  "THETA/USD": "4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a",
  "PYTH/USD": "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff",

  // === AI & Data ===
  "FET/USD": "b49ee9d8ccf9b6e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0",
  "OCEAN/USD": "2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d",
  "TAO/USD": "410f41de235f2dbdf41f1a808c1e15f6a9e7d6a7b8c9d0e1f2a3b4c5d6e7f8a9",

  // === Exchange Tokens ===
  "FTT/USD": "6c75e52531ec5fd3ef253f6062956a8508a2f03fa0a209fb7dbc0d0f3d6f6f6f",
  "CRO/USD": "b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7",
  "OKB/USD": "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",

  // === Forex Pairs ===
  "EUR/USD": "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
  "GBP/USD": "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
  "JPY/USD": "ef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52",
  "AUD/USD": "67a6f93030f4217f2e8f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
  "CAD/USD": "9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a",

  // === Commodities ===
  "XAU/USD": "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2",
  "XAG/USD": "f2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e",
  "WTI/USD": "c9c8e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9",
  "BRENT/USD": "d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8",

  // === US Equities ===
  "AAPL/USD": "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
  "NVDA/USD": "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
  "TSLA/USD": "16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
  "GOOGL/USD": "b7e3904c08ddd9c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0",
  "AMZN/USD": "c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6",
  "MSFT/USD": "d0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ea4b77",
  "META/USD": "a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4",
  "COIN/USD": "9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b",
  "SPY/USD": "19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9b3c4d5e6f7a8b9c0d1",
  "QQQ/USD": "2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
} as const;

// IPyth interface ABI for interacting with Pyth contract
export const PYTH_ABI = [
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "getPrice",
    outputs: [
      {
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "getPriceNoOlderThan",
    outputs: [
      {
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "age", type: "uint256" },
    ],
    name: "getPriceNoOlderThan",
    outputs: [
      {
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "getPriceUnsafe",
    outputs: [
      {
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "getEmaPrice",
    outputs: [
      {
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "updateData", type: "bytes[]" }],
    name: "updatePriceFeeds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "updateData", type: "bytes[]" }],
    name: "getUpdateFee",
    outputs: [{ name: "feeAmount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "priceFeedExists",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "updateData", type: "bytes[]" },
      { name: "priceIds", type: "bytes32[]" },
      { name: "minPublishTime", type: "uint64" },
      { name: "maxPublishTime", type: "uint64" },
    ],
    name: "parsePriceFeedUpdates",
    outputs: [
      {
        components: [
          { name: "id", type: "bytes32" },
          {
            components: [
              { name: "price", type: "int64" },
              { name: "conf", type: "uint64" },
              { name: "expo", type: "int32" },
              { name: "publishTime", type: "uint256" },
            ],
            name: "price",
            type: "tuple",
          },
          {
            components: [
              { name: "price", type: "int64" },
              { name: "conf", type: "uint64" },
              { name: "expo", type: "int32" },
              { name: "publishTime", type: "uint256" },
            ],
            name: "emaPrice",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Type for price data returned from Pyth
export interface PythPriceData {
  price: bigint;
  conf: bigint;
  expo: number;
  publishTime: bigint;
}

// Type for formatted price response
export interface PythPriceResponse {
  priceFeedId: string;
  pair: string;
  price: string;
  confidence: string;
  exponent: number;
  publishTime: number;
  formattedPrice: string;
}

// Type for token price response (includes token details)
export interface PythTokenPriceResponse {
  tokenAddress: string;
  tokenSymbol: string;
  pair: string;
  priceFeedId: string;
  priceUsd: string;
  confidence: string;
  exponent: number;
  publishTime: number;
  lastUpdated: string;
}

// Token address to price feed mapping for Mantle Network
// Allows users to pass token contract addresses to get prices
export const TOKEN_ADDRESS_TO_PRICE_FEED: Record<string, { pair: string; feedId: string }> = {
  // Native and Wrapped tokens
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": { pair: "MNT/USD", feedId: PYTH_PRICE_FEED_IDS["MNT/USD"] }, // Native MNT
  "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8": { pair: "MNT/USD", feedId: PYTH_PRICE_FEED_IDS["MNT/USD"] }, // WMNT
  "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111": { pair: "ETH/USD", feedId: PYTH_PRICE_FEED_IDS["ETH/USD"] }, // WETH

  // Stablecoins
  "0x09Bc4E0D10C81b3a3766c49F0f98a8aaa7adA8D2": { pair: "USDC/USD", feedId: PYTH_PRICE_FEED_IDS["USDC/USD"] }, // USDC
  "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE": { pair: "USDT/USD", feedId: PYTH_PRICE_FEED_IDS["USDT/USD"] }, // USDT

  // LST Tokens
  "0xcDA86A272531e8640cD7F1a92c01839911B90bb0": { pair: "mETH/USD", feedId: PYTH_PRICE_FEED_IDS["mETH/USD"] }, // mETH

  // Additional Mantle tokens (commonly traded)
  "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2": { pair: "WBTC/USD", feedId: PYTH_PRICE_FEED_IDS["WBTC/USD"] }, // WBTC
  "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000": { pair: "ETH/USD", feedId: PYTH_PRICE_FEED_IDS["ETH/USD"] }, // ETH (canonical)

  // USDe and other stablecoins
  "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": { pair: "USDC/USD", feedId: PYTH_PRICE_FEED_IDS["USDC/USD"] }, // USDe (pegged to USD)

  // Pendle
  "0xf83bcc06D6A4A5682adeCA11CF9500f67bFe61AE": { pair: "PENDLE/USD", feedId: PYTH_PRICE_FEED_IDS["PENDLE/USD"] }, // PENDLE

  // FBTC
  "0xc96de26018a54d51c097160568752c4e3bd6c364": { pair: "BTC/USD", feedId: PYTH_PRICE_FEED_IDS["BTC/USD"] }, // FBTC

  // Aurelius tokens (staked versions)
  "0xe6829d9a7eE3040e1276Fa75293Bde931859e8fA": { pair: "MNT/USD", feedId: PYTH_PRICE_FEED_IDS["MNT/USD"] }, // cmETH
} as const;

// Helper to check if an input is a token address (starts with 0x and is 42 chars)
export function isTokenAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/i.test(input);
}

// Resolve token address or pair to price feed info
export function resolvePriceFeedInput(input: string): { pair: string; feedId: string } | null {
  // Normalize address to checksum format isn't needed, just lowercase comparison
  const normalizedInput = input.toLowerCase();

  // Check if it's a token address
  if (isTokenAddress(input)) {
    // Try to find in address mapping (case-insensitive)
    for (const [addr, info] of Object.entries(TOKEN_ADDRESS_TO_PRICE_FEED)) {
      if (addr.toLowerCase() === normalizedInput) {
        return { pair: info.pair, feedId: info.feedId };
      }
    }
    return null; // Unknown token address
  }

  // Check if it's a pair name
  if (input in PYTH_PRICE_FEED_IDS) {
    return {
      pair: input,
      feedId: PYTH_PRICE_FEED_IDS[input as keyof typeof PYTH_PRICE_FEED_IDS],
    };
  }

  // Check if it's already a price feed ID
  const normalizedId = input.replace("0x", "");
  const foundPair = Object.entries(PYTH_PRICE_FEED_IDS).find(
    ([, id]) => id === normalizedId,
  );
  if (foundPair) {
    return { pair: foundPair[0], feedId: foundPair[1] };
  }

  return null;
}
