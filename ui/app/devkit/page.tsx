"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  LayoutDashboard,
  Layers,
  Code,
  Cpu,
  Copy,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Wallet,
  FileCode,
  BookOpen,
  ChevronDown,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition } from "@/components/page-transition"

const PROJECT_STORAGE_KEY = "stellar-devkit-project"

type DevKitProject = {
  name: string
  appId: string
  payoutWallet: string
}

// ─── 5 DeFi protocols (Protocols tab: hover dropdown → Contract + Docs) ─────
const STELLAR_EXPERT_CONTRACT = "https://stellar.expert/explorer/public/contract"

const DEFI_PROTOCOLS = [
  {
    id: "soroswap",
    name: "SoroSwap Finance",
    contractId: "CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH",
    contractUrl: `${STELLAR_EXPERT_CONTRACT}/CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH`,
    docsUrl: "https://soroswap.finance",
  },
  {
    id: "blend",
    name: "Blend",
    contractId: "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS",
    contractUrl: `${STELLAR_EXPERT_CONTRACT}/CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS`,
    docsUrl: "https://blend.capital",
  },
  {
    id: "allbridge",
    name: "Allbridge Core",
    contractId: null,
    contractUrl: "https://docs-core.allbridge.io/sdk/guides/stellar",
    docsUrl: "https://docs-core.allbridge.io/sdk/guides/stellar",
  },
  {
    id: "fxdao",
    name: "FxDAO",
    contractId: "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB",
    contractUrl: `${STELLAR_EXPERT_CONTRACT}/CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB`,
    docsUrl: "https://fxdao.io/docs",
  },
  {
    id: "reflector",
    name: "Reflector",
    contractId: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M",
    contractUrl: `${STELLAR_EXPERT_CONTRACT}/CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`,
    docsUrl: "https://developers.stellar.org/docs/data/oracles/oracle-providers",
  },
] as const

// ─── Code generator options (Code generator tab) ───────────────────────────
const PROTOCOLS = [
  { id: "swap-soroswap", title: "Swap on SoroSwap", codeKey: "swap", tryItHref: "/swap" as string | null },
  { id: "get-quote", title: "Get swap quote", codeKey: "quote", tryItHref: "/swap" as string | null },
  { id: "send-payment", title: "Send payment", codeKey: "sendPayment", tryItHref: "/swap?tab=send" as string | null },
  { id: "x402-server", title: "x402 payment-gated API", codeKey: "x402Server", tryItHref: null },
  { id: "x402-client", title: "x402 client (pay with Stellar)", codeKey: "x402Client", tryItHref: null },
  { id: "one-shot-swap", title: "One-shot swap (dexSwapExactIn)", codeKey: "oneShotSwap", tryItHref: "/swap" as string | null },
  { id: "full-setup", title: "Full setup example", codeKey: "fullSetup", tryItHref: "/swap" as string | null },
  { id: "oracle-reflector", title: "Get price (Reflector oracle)", codeKey: "getPrice", tryItHref: null },
  { id: "lending-blend-supply", title: "Lending: supply (Blend)", codeKey: "lendingSupply", tryItHref: null },
  { id: "lending-blend-borrow", title: "Lending: borrow (Blend)", codeKey: "lendingBorrow", tryItHref: null },
]

// ─── Code generator snippets (from your SDKs) ─────────────────────────────
const CODE_SNIPPETS: Record<string, { filename: string; code: string }> = {
  swap: {
    filename: "swap-soroswap.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000" // 1 XLM in stroops
);
const result = await agent.dexSwap(quote);
console.log("Swap tx hash:", result.hash);`,
  },
  quote: {
    filename: "get-quote.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const quote = await agent.dexGetQuote(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
console.log("Quote:", quote);`,
  },
  sendPayment: {
    filename: "send-payment.ts",
    code: `import { StellarAgentKit } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Send 10 XLM to destination
const result = await agent.sendPayment(
  "GDEST...",
  "10"
);
console.log("Payment tx hash:", result.hash);

// Send USDC (pass asset code + issuer)
// await agent.sendPayment("GDEST...", "100", "USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");`,
  },
  x402Server: {
    filename: "x402-server.ts",
    code: `import { x402 } from "x402-stellar-sdk/server";

app.use("/api/premium", x402({
  price: "1",
  assetCode: "XLM",
  network: "mainnet",
  destination: "G...",
  memo: "premium",
}));
app.get("/api/premium", (_, res) => res.json({ data: "Premium" }));`,
  },
  x402Client: {
    filename: "x402-client.ts",
    code: `import { x402Fetch } from "x402-stellar-sdk/client";

const res = await x402Fetch(url, undefined, {
  payWithStellar: async (req) => {
    // Send payment to req.destination, req.amount, req.assetCode
    return { transactionHash: "..." };
  },
});
const data = await res.json();`,
  },
  oneShotSwap: {
    filename: "swap-one-shot.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// Quote + swap in one call
const result = await agent.dexSwapExactIn(
  { contractId: MAINNET_ASSETS.XLM.contractId },
  { contractId: MAINNET_ASSETS.USDC.contractId },
  "10000000"
);
console.log("Swap tx hash:", result.hash);`,
  },
  fullSetup: {
    filename: "full-setup.ts",
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
  getPrice: {
    filename: "get-price.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

// By on-chain token contract ID
const priceData = await agent.getPrice({ contractId: MAINNET_ASSETS.XLM.contractId });
console.log("Price (raw):", priceData.price, "decimals:", priceData.decimals, "timestamp:", priceData.timestamp);

// By ticker symbol (Reflector CEX/DEX or fiat feed)
// const btc = await agent.getPrice({ symbol: "BTC" });`,
  },
  lendingSupply: {
    filename: "lending-supply.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS, BLEND_POOLS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const result = await agent.lendingSupply({
  poolId: BLEND_POOLS.mainnet,
  assetContractId: MAINNET_ASSETS.USDC.contractId,
  amount: "1000000", // 1 USDC (6 decimals) in smallest units
});
console.log("Supply tx hash:", result.hash);`,
  },
  lendingBorrow: {
    filename: "lending-borrow.ts",
    code: `import { StellarAgentKit, MAINNET_ASSETS, BLEND_POOLS } from "stellar-agent-kit";

const agent = new StellarAgentKit(process.env.SECRET_KEY!, "mainnet");
await agent.initialize();

const result = await agent.lendingBorrow({
  poolId: BLEND_POOLS.mainnet,
  assetContractId: MAINNET_ASSETS.USDC.contractId,
  amount: "500000", // 0.5 USDC in smallest units
});
console.log("Borrow tx hash:", result.hash);`,
  },
}

function generateAppId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "")
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

export default function DevKitPage() {
  const [project, setProject] = useState<DevKitProject | null>(null)
  const [projectNameInput, setProjectNameInput] = useState("")
  const [showAppId, setShowAppId] = useState(false)
  const [editingPayout, setEditingPayout] = useState(false)
  const [payoutInput, setPayoutInput] = useState("")
  const [codeGenKey, setCodeGenKey] = useState<string>("swap")
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState(false)

  const loadProject = useCallback(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(PROJECT_STORAGE_KEY) : null
      if (raw) {
        const p = JSON.parse(raw) as DevKitProject
        setProject(p)
        setPayoutInput(p.payoutWallet)
        fetch("/api/v1/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: p.name, appId: p.appId, payoutWallet: p.payoutWallet }),
        }).catch(() => {})
      }
    } catch {
      setProject(null)
    }
  }, [])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const createProject = async () => {
    const name = projectNameInput.trim() || "My Project"
    const appId = generateAppId()
    const payoutWallet = ""
    const p: DevKitProject = { name, appId, payoutWallet }
    setProject(p)
    setPayoutInput("")
    setProjectNameInput("")
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(p))
      await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, appId, payoutWallet }),
      })
    } catch {}
  }

  const deleteProject = () => {
    if (typeof window !== "undefined" && window.confirm("Delete this project permanently?")) {
      setProject(null)
      setProjectNameInput("")
      setEditingPayout(false)
      try {
        localStorage.removeItem(PROJECT_STORAGE_KEY)
      } catch {}
    }
  }

  const savePayoutWallet = () => {
    if (project && payoutInput.trim()) {
      const next = { ...project, payoutWallet: payoutInput.trim() }
      setProject(next)
      setEditingPayout(false)
      try {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(next))
      } catch {}
    }
  }

  const apiEndpoint =
    typeof window !== "undefined" && project
      ? `${window.location.origin}/api/v1/validate?appId=${project.appId}`
      : ""

  const copyCode = () => {
    const snip = CODE_SNIPPETS[codeGenKey]
    if (snip) {
      navigator.clipboard.writeText(snip.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const copyEndpoint = () => {
    if (apiEndpoint) {
      navigator.clipboard.writeText(apiEndpoint)
      setCopiedEndpoint(true)
      setTimeout(() => setCopiedEndpoint(false), 2000)
    }
  }

  const copyWallet = () => {
    if (project?.payoutWallet) {
      navigator.clipboard.writeText(project.payoutWallet)
      setCopiedWallet(true)
      setTimeout(() => setCopiedWallet(false), 2000)
    }
  }

  const currentSnippet = CODE_SNIPPETS[codeGenKey]

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <PageTransition>
      <section className="relative z-20 py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-6 sm:px-8 lg:px-12">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-balance tracking-tight">
              DevKit
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              Create a project to get your API key, then use Protocols and Code generator to try each SDK. MCP tab shows how to use the Stellar MCP server in Cursor.
            </p>
          </header>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 mb-8 rounded-full flex flex-wrap gap-1">
              <TabsTrigger
                value="overview"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-6 py-3 rounded-full transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="protocols"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-6 py-3 rounded-full transition-all flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Protocols
              </TabsTrigger>
              <TabsTrigger
                value="codegen"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-6 py-3 rounded-full transition-all flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                Code generator
              </TabsTrigger>
              <TabsTrigger
                value="mcp"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-6 py-3 rounded-full transition-all flex items-center gap-2"
              >
                <Cpu className="h-4 w-4" />
                MCP
              </TabsTrigger>
            </TabsList>

            {/* ─── Overview: Project creation + key ───────────────────────────── */}
            <TabsContent value="overview" className="mt-8 space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Project name"
                    value={project ? project.name : projectNameInput}
                    onChange={(e) => (project ? null : setProjectNameInput(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && !project && createProject()}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 max-w-xs"
                    readOnly={!!project}
                  />
                  {!project && (
                    <Button
                      onClick={createProject}
                      className="bg-[#5100fd] hover:bg-[#5100fd]/90 text-white shrink-0"
                    >
                      + Create Project
                    </Button>
                  )}
                </div>
              </div>

              {project && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 space-y-6">
                  <p className="text-sm text-zinc-500">Project: {project.name}</p>

                  <div>
                    <p className="text-sm text-zinc-400 mb-1">APP Id</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-black/50 px-3 py-2 text-sm font-mono text-zinc-300">
                        {showAppId ? project.appId : "••••••••••••••••••••••••••••••••"}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowAppId((s) => !s)}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5"
                        aria-label={showAppId ? "Hide" : "Show"}
                      >
                        {showAppId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400 mb-1">API Endpoint</p>
                    <p className="text-xs text-zinc-500 mb-2">
                      Use this endpoint in your server SDK configuration.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg bg-black/50 px-3 py-2 text-sm font-mono text-zinc-300">
                        {apiEndpoint}
                      </code>
                      <button
                        type="button"
                        onClick={copyEndpoint}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-1"
                      >
                        {copiedEndpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                      Payout Wallet
                      <button
                        type="button"
                        onClick={() => (editingPayout ? savePayoutWallet() : setEditingPayout(true))}
                        className="p-1 rounded text-zinc-500 hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </p>
                    {editingPayout ? (
                      <div className="flex gap-2">
                        <Input
                          value={payoutInput}
                          onChange={(e) => setPayoutInput(e.target.value)}
                          placeholder="Enter your Stellar address (G...)"
                          className="bg-black/50 border-zinc-700 text-white font-mono text-sm"
                        />
                        <Button size="sm" onClick={savePayoutWallet} className="shrink-0">
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <code className="flex-1 truncate rounded-lg bg-black/50 px-3 py-2 text-sm font-mono text-zinc-300">
                          {project.payoutWallet || "Not set — click Edit to add"}
                        </code>
                        <button
                          type="button"
                          onClick={copyWallet}
                          disabled={!project?.payoutWallet}
                          className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {copiedWallet ? <Check className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-zinc-800">
                    <p className="text-sm font-medium text-zinc-400 mb-2">Danger Zone</p>
                    <p className="text-sm text-zinc-500 mb-3">Delete this project permanently.</p>
                    <Button
                      variant="destructive"
                      onClick={deleteProject}
                      className="bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ─── Protocols: name-only cards, click opens Code generator ──────── */}
            <TabsContent value="protocols" className="mt-8">
              <p className="text-zinc-400 mb-6">
                The 5 DeFi protocols integrated in the kit. Hover for Contract and Docs links.
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DEFI_PROTOCOLS.map((proto) => (
                  <li key={proto.id} className="group relative">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 py-4 px-4 hover:border-[#5100fd]/50 hover:bg-zinc-900/50 transition-colors flex items-center justify-between gap-2">
                      <span className="font-medium text-white">{proto.name}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 shrink-0 transition-transform group-hover:rotate-180" />
                    </div>
                    <div className="absolute top-full left-0 right-0 z-10 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1">
                      <a
                        href={proto.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <FileCode className="h-4 w-4 shrink-0" />
                        {proto.contractId ? "Contract" : "SDK / Contract"}
                      </a>
                      <a
                        href={proto.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        Docs
                      </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* ─── Code generator: SDK snippets + Copy + Try it ───────────────── */}
            <TabsContent value="codegen" className="mt-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-56 shrink-0 space-y-1">
                  {PROTOCOLS.map((proto) => (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() => setCodeGenKey(proto.codeKey)}
                      className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors ${
                        codeGenKey === proto.codeKey
                          ? "bg-[#5100fd]/20 text-[#a78bfa] border border-[#5100fd]/40"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent"
                      }`}
                    >
                      {proto.title}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                  {currentSnippet && (
                    <>
                      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800 bg-black/30">
                        <span className="text-sm font-mono text-zinc-400">{currentSnippet.filename}</span>
                        <div className="flex items-center gap-2">
                          {PROTOCOLS.find((p) => p.codeKey === codeGenKey)?.tryItHref && (
                            <Link
                              href={PROTOCOLS.find((p) => p.codeKey === codeGenKey)!.tryItHref!}
                              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                              Try it <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={copyCode}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
                          >
                            {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copiedCode ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[420px] overflow-y-auto">
                        <code>{currentSnippet.code}</code>
                      </pre>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">Test the SDKs one by one</p>
                <ul className="text-sm text-zinc-500 space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-zinc-400">Swap / Quote:</strong> Use &quot;Try it&quot; to open the Swap page and run a real swap with Freighter.
                  </li>
                  <li>
                    <strong className="text-zinc-400">Send payment:</strong> Use &quot;Try it&quot; to open the Swap page (Send tab).
                  </li>
                  <li>
                    <strong className="text-zinc-400">stellar-agent-kit in terminal:</strong> From repo root run{" "}
                    <code className="rounded bg-black/50 px-1">node scripts/test-sdk.mjs</code> (set{" "}
                    <code className="rounded bg-black/50 px-1">SECRET_KEY</code> and optionally{" "}
                    <code className="rounded bg-black/50 px-1">SOROSWAP_API_KEY</code>).
                  </li>
                  <li>
                    <strong className="text-zinc-400">MCP:</strong> See the MCP tab for Cursor setup; then ask Claude to use get_stellar_contract or get_sdk_snippet.
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* ─── MCP tab ───────────────────────────────────────────────────── */}
            <TabsContent value="mcp" className="mt-8 space-y-8">
              <p className="text-zinc-400">
                The <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">stellar-devkit-mcp</code> server exposes Stellar contract IDs and SDK snippets to LLMs (e.g. Claude in Cursor). Add it in Cursor settings to get tools and resources.
              </p>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Install &amp; configure in Cursor</h3>
                <pre className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400 font-mono overflow-x-auto">
{`# Install the MCP server (already in your project if you use the monorepo)
npm install stellar-devkit-mcp

# Add to Cursor MCP settings (e.g. .cursor/mcp.json or Cursor Settings > MCP):
{
  "mcpServers": {
    "stellar-devkit": {
      "command": "npx",
      "args": ["stellar-devkit-mcp"]
    }
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Tools</h3>
                <ul className="space-y-3">
                  <li className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="font-mono text-sm text-[#a78bfa]">get_stellar_contract</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Get Soroban contract ID for a protocol (e.g. soroswap mainnet).
                    </p>
                  </li>
                  <li className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="font-mono text-sm text-[#a78bfa]">get_sdk_snippet</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Get code snippet for StellarAgentKit or x402 (swap, quote, x402-server, x402-client).
                    </p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Resources</h3>
                <p className="text-sm text-zinc-500 mb-2">
                  The server also exposes Stellar docs/content as MCP resources (e.g. stellar://...) so the model can read them when needed.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <h3 className="text-lg font-medium text-white mb-2">How to show MCP working</h3>
                <ol className="text-sm text-zinc-400 space-y-3 list-decimal list-inside">
                  <li>
                    <strong className="text-zinc-300">Add the server:</strong> In Cursor go to Settings → MCP (or add the config above to <code className="rounded bg-zinc-800 px-1">.cursor/mcp.json</code>). Use <code className="rounded bg-zinc-800 px-1">command: "npx"</code>, <code className="rounded bg-zinc-800 px-1">args: ["stellar-devkit-mcp"]</code>. Save and restart Cursor so the server starts.
                  </li>
                  <li>
                    <strong className="text-zinc-300">Check it’s connected:</strong> In Cursor chat, open the MCP / tools area. You should see <code className="rounded bg-zinc-800 px-1">stellar-devkit</code> with tools like <code className="rounded bg-zinc-800 px-1">get_stellar_contract</code> and <code className="rounded bg-zinc-800 px-1">get_sdk_snippet</code>.
                  </li>
                  <li>
                    <strong className="text-zinc-300">Trigger the tools:</strong> In a new Cursor chat, try (tool descriptions are now more directive so the model is more likely to call them):
                    <ul className="mt-2 ml-4 list-disc text-zinc-500 space-y-1">
                      <li>“Use the Stellar DevKit MCP tool to get the SoroSwap mainnet contract ID.”</li>
                      <li>If the model answers without calling the tool, try: “Call the get_stellar_contract tool with protocol soroswap and network mainnet.”</li>
                      <li>“Call get_sdk_snippet with operation swap and show me the code.”</li>
                    </ul>
                    When the model actually invokes the tool, you’ll see the contract ID or snippet in the reply; check the MCP server debug log for “CallTool received” to confirm.
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      </PageTransition>
    </main>
  )
}
