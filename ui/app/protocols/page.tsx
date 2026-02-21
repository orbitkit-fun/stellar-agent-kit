"use client"

import { useState } from "react"
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Code2, ArrowLeftRight, Landmark, LineChart, Layers, Link2, Vote } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Contract IDs from stellar-agent-kit + protocol docs (mainnet)
const SOROSWAP_AGGREGATOR = "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH"
const BLEND_POOL_MAINNET = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
const REFLECTOR_DEX = "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M"
// FxDAO mainnet (fxdao.io/docs/addresses)
const FXDAO_VAULTS_MAINNET = "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB"
const FXDAO_LOCKING_POOL_MAINNET = "CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP"
// Allbridge Core: no single aggregator contract; use their SDK (docs-core.allbridge.io)

type Protocol = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  network: "Mainnet"
  /** Soroban contract ID (C...). Omit for SDK-only integrations (e.g. Allbridge). */
  contractId: string | null
  methods: string[]
  icon: React.ReactNode
}

const PROTOCOLS: Protocol[] = [
  {
    id: "soroswap",
    name: "SoroSwap Finance",
    description: "The first DEX aggregator on Stellar, enabling users to swap tokens at optimal prices, provide liquidity, and access Soroban-based DeFi with fast transactions. Prominent in TVL leaderboards for Stellar protocols.",
    category: "DEX",
    tags: ["DEX", "Aggregator", "Mainnet"],
    url: "https://soroswap.finance",
    network: "Mainnet",
    contractId: SOROSWAP_AGGREGATOR,
    methods: ["dexGetQuote()", "dexSwap()", "dexSwapExactIn()"],
    icon: <ArrowLeftRight className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "blend",
    name: "Blend",
    description: "A lending protocol primitive on Stellar, allowing users to create customizable lending pools for depositing assets to earn interest or borrowing against collateral. Supports diverse use cases and is highlighted in community favorites for underserved markets.",
    category: "Lending",
    tags: ["Lending", "Mainnet"],
    url: "https://blend.capital",
    network: "Mainnet",
    contractId: BLEND_POOL_MAINNET,
    methods: ["lendingSupply()", "lendingBorrow()"],
    icon: <Landmark className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "allbridge",
    name: "Allbridge Core",
    description: "Cross-chain bridge connecting Stellar to 10+ EVM and non-EVM networks, facilitating interoperability and asset transfers in DeFi. Ranks among top Stellar projects by user metrics. Integrate via Allbridge Core SDK.",
    category: "Bridge",
    tags: ["Bridge", "Cross-chain", "Mainnet"],
    url: "https://docs-core.allbridge.io/sdk/guides/stellar",
    network: "Mainnet",
    contractId: null,
    methods: ["send()", "rawTxBuilder.send()", "getBalanceLine()", "buildChangeTrustLineXdrTx()"],
    icon: <Link2 className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "fxdao",
    name: "FxDAO",
    description: "Notable DeFi protocol on Stellar: decentralized borrowing with synthetic stablecoins (USDx, EURx, GBPx). Lock Lumens for stablecoins; features Vaults, Safety Pool, and Staking. Featured in TVL rankings alongside Aquarius and SoroSwap.",
    category: "DeFi",
    tags: ["DeFi", "Borrowing", "Stablecoins", "Mainnet"],
    url: "https://fxdao.io/docs",
    network: "Mainnet",
    contractId: FXDAO_VAULTS_MAINNET,
    methods: ["Vaults (collateral)", "Locking Pool", "USDx / EURx / GBPx", "FXG governance"],
    icon: <Vote className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "phoenix",
    name: "Phoenix",
    description: "DeFi hub on Soroban. DEX liquidity is routed via the SoroSwap aggregator for optimal swaps.",
    category: "DEX",
    tags: ["DEX", "AMM", "Mainnet"],
    url: "https://www.phoenix-hub.io",
    network: "Mainnet",
    contractId: SOROSWAP_AGGREGATOR,
    methods: ["dexGetQuote()", "dexSwap()", "dexSwapExactIn()"],
    icon: <Layers className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "reflector",
    name: "Reflector",
    description: "Price oracles (SEP-40). DEX, CEX/DEX, and fiat feeds for Stellar and external assets.",
    category: "Oracle",
    tags: ["Oracle", "Mainnet"],
    url: "https://developers.stellar.org/docs/data/oracles/oracle-providers",
    network: "Mainnet",
    contractId: REFLECTOR_DEX,
    methods: ["getPrice()"],
    icon: <LineChart className="h-6 w-6 text-[#a78bfa]" />,
  },
  {
    id: "aqua",
    name: "Aqua (Aquarius)",
    description: "Community AMM with liquidity incentives. Routed via SoroSwap aggregator for best execution.",
    category: "DEX",
    tags: ["DEX", "AMM", "Mainnet"],
    url: "https://aqua.network",
    network: "Mainnet",
    contractId: SOROSWAP_AGGREGATOR,
    methods: ["dexGetQuote()", "dexSwap()", "dexSwapExactIn()"],
    icon: <Layers className="h-6 w-6 text-[#a78bfa]" />,
  },
]

function ContractCopy({ contractId }: { contractId: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(contractId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const truncated = contractId.slice(0, 18) + "…" + contractId.slice(-8)
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5">
      <code className="flex-1 min-w-0 truncate text-sm text-zinc-300 font-mono" title={contractId}>
        {truncated}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-md border border-zinc-600 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700">
            {protocol.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{protocol.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {protocol.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <a
          href={protocol.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
          aria-label={`Open ${protocol.name}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
        {protocol.description}
      </p>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <span>Contract &amp; Methods</span>
            {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-4 pt-2 border-t border-zinc-800">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{protocol.network}</p>
              {protocol.contractId ? (
                <ContractCopy contractId={protocol.contractId} />
              ) : (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-400">
                  Integration via protocol SDK. See{" "}
                  <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:underline">
                    {protocol.name} docs
                  </a>.
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Methods</p>
              <div className="flex flex-wrap gap-2">
                {protocol.methods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex rounded-md bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-mono text-zinc-300"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// Code Generator tab — protocol-scoped snippets
const CODE_BY_PROTOCOL: Record<string, { filename: string; code: string }> = {
  soroswap: {
    filename: "swap-soroswap.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
const result = await agent.dexSwap(quote);
console.log("Swap tx hash:", result.hash);`,
  },
  blend: {
    filename: "lending-blend.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS, BLEND_POOLS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Supply
await agent.lendingSupply({
  poolId: BLEND_POOLS.mainnet,
  assetContractId: MAINNET_ASSETS.USDC.contractId,
  amount: "1000000",
});

// Borrow
await agent.lendingBorrow({
  poolId: BLEND_POOLS.mainnet,
  assetContractId: MAINNET_ASSETS.USDC.contractId,
  amount: "500000",
});`,
  },
  reflector: {
    filename: "oracle-reflector.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const price = await agent.getPrice({ contractId: MAINNET_ASSETS.XLM.contractId });
console.log("Price:", price.price, "decimals:", price.decimals);`,
  },
  allbridge: {
    filename: "bridge-allbridge.ts",
    code: `// Allbridge Core: cross-chain transfers to/from Stellar. Use their SDK.
// Install: npm install @allbridge/bridge-core-sdk
// Docs: https://docs-core.allbridge.io/sdk/guides/stellar/transfer

import { AllbridgeCoreSdk, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ChainSymbol } from "@allbridge/bridge-core-sdk";
import { Keypair } from "@stellar/stellar-sdk";

const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
const chainDetailsMap = await sdk.chainDetailsMap();
const sourceToken = chainDetailsMap[ChainSymbol.SRB].tokens.find((t) => t.symbol === "USDT");
const destinationToken = chainDetailsMap[ChainSymbol.ETH].tokens.find((t) => t.symbol === "USDT");

const xdrTx = await sdk.bridge.rawTxBuilder.send({
  amount: "10",
  fromAccountAddress: keypair.publicKey(),
  toAccountAddress: destinationAddress,
  sourceToken,
  destinationToken,
  messenger: "allbridge",
});
// Sign with Keypair and submit via sdk.utils.srb.sendTransactionSoroban(signedTx)`,
  },
  fxdao: {
    filename: "defi-fxdao.ts",
    code: `// FxDAO: synthetic stablecoins (USDx, EURx, GBPx) and vaults on Stellar.
// Contract IDs (mainnet): https://fxdao.io/docs/addresses
// Vaults: CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB
// Locking Pool: CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP

// Interact via Soroban Contract API or FxDAO SDK when available.
import { Contract, SorobanRpc } from "@stellar/stellar-sdk";

const FXDAO_VAULTS = "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB";
const server = new SorobanRpc.Server("https://soroban-rpc.mainnet.stellar.gateway.fm");
const contract = new Contract(FXDAO_VAULTS);
// Call contract methods per FxDAO docs (e.g. deposit, withdraw).`,
  },
}

function CodeGeneratorTab() {
  const [selected, setSelected] = useState<string>("soroswap")
  const [copied, setCopied] = useState(false)
  const block = CODE_BY_PROTOCOL[selected]
  const handleCopy = () => {
    if (block) {
      navigator.clipboard.writeText(block.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm">
        Copy-paste examples per protocol. Use with <code className="rounded bg-zinc-800 px-1">stellar-agent-kit</code> and your <code className="rounded bg-zinc-800 px-1">SECRET_KEY</code> + <code className="rounded bg-zinc-800 px-1">SOROSWAP_API_KEY</code> (for DEX).
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(CODE_BY_PROTOCOL).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected === key
                ? "bg-[#5100fd] text-white"
                : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {PROTOCOLS.find((p) => p.id === key)?.name ?? key}
          </button>
        ))}
      </div>
      {block && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm text-zinc-500 font-mono">{block.filename}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="p-4 text-xs text-zinc-400 overflow-x-auto max-h-80 overflow-y-auto font-mono leading-relaxed whitespace-pre">
            <code>{block.code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default function ProtocolsPage() {
  const [tab, setTab] = useState<"explorer" | "code">("explorer")

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>
        <section className="relative z-20 py-16 md:py-24">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-12">
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Agent Kit
              </h1>
              <p className="mt-2 text-lg text-zinc-400">
                / DeFi protocol integrations
              </p>
            </header>

            <div className="flex gap-2 mb-10">
              <button
                type="button"
                onClick={() => setTab("explorer")}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  tab === "explorer"
                    ? "bg-[#5100fd]/20 border border-[#5100fd] text-white"
                    : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                Protocol Explorer
              </button>
              <button
                type="button"
                onClick={() => setTab("code")}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  tab === "code"
                    ? "bg-[#5100fd]/20 border border-[#5100fd] text-white"
                    : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                Code Generator
              </button>
            </div>

            {tab === "explorer" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {PROTOCOLS.map((protocol) => (
                  <ProtocolCard key={protocol.id} protocol={protocol} />
                ))}
              </div>
            )}

            {tab === "code" && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="h-5 w-5 text-[#a78bfa]" />
                  <h2 className="text-lg font-semibold text-white">Code Generator</h2>
                </div>
                <CodeGeneratorTab />
              </div>
            )}
          </div>
        </section>
      </PageTransition>
    </main>
  )
}
