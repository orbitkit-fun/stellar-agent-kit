import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

const integrations = [
  {
    title: "SoroSwap",
    description: "DEX aggregator on Stellar: swap tokens across SoroSwap, Phoenix, and Aqua for best execution.",
    href: "https://soroswap.finance",
  },
  {
    title: "Freighter",
    description: "Stellar wallet extension for browser: sign transactions and connect to dApps.",
    href: "https://www.freighter.app",
  },
  {
    title: "Stellar Horizon",
    description: "REST API for the Stellar network: accounts, transactions, and ledger data.",
    href: "https://developers.stellar.org/api",
  },
  {
    title: "Soroban",
    description: "Smart contract platform on Stellar: deploy and invoke contracts with Rust or JavaScript.",
    href: "https://soroban.stellar.org",
  },
  {
    title: "Stellar Quest",
    description: "Learn Stellar and Soroban through guided challenges and earn rewards.",
    href: "https://quest.stellar.org",
  },
  {
    title: "Stellar Development Foundation",
    description: "Documentation, SDKs, and ecosystem resources for building on Stellar.",
    href: "https://developers.stellar.org",
  },
]

function Integrations() {
  return (
    <section className="py-32 relative z-20">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-light text-balance">Ecosystem</h2>
        <p className="text-lg md:text-xl text-zinc-400 mb-12">
          Stellar-native tools and platforms that work with this kit.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item, i) => (
            <li key={i}>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-colors h-full group">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-medium text-white group-hover:text-[#a78bfa] transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mt-2">{item.description}</p>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const Tools = Integrations
export { Tools, Integrations }
