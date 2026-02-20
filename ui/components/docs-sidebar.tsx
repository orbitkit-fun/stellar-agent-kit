"use client"

import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"

const SECTIONS = [
  { id: "overview", label: "Introduction" },
  { id: "getting-started", label: "Getting started" },
  { id: "quick-start", label: "Quick start" },
  { id: "stellar-agent-kit", label: "stellar-agent-kit" },
  { id: "x402-stellar-sdk", label: "x402-stellar-sdk" },
  { id: "create-stellar-devkit-app", label: "create-stellar-devkit-app" },
  { id: "stellar-devkit-mcp", label: "stellar-devkit-mcp" },
  { id: "cli", label: "CLI" },
  { id: "ui-and-apis", label: "UI & APIs" },
  { id: "env-reference", label: "Env reference" },
  { id: "networks-and-contracts", label: "Networks & contracts" },
  { id: "project-structure", label: "Project structure" },
  { id: "development", label: "Development" },
  { id: "links", label: "Links" },
] as const

function getHash() {
  if (typeof window === "undefined") return ""
  return window.location.hash.slice(1) || "overview"
}
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb)
  return () => window.removeEventListener("hashchange", cb)
}

export function DocsSidebar() {
  const pathname = usePathname()
  const activeId = useSyncExternalStore(subscribe, getHash, () => "overview")
  const isDocs = pathname === "/docs"

  return (
    <aside className="w-56 shrink-0 hidden md:block border-r border-zinc-800 bg-zinc-950/60">
      <nav className="sticky top-24 py-6 pl-6 pr-3 overflow-y-auto max-h-[calc(100vh-6rem)]">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">On this page</p>
        <ul className="space-y-1 text-sm">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={isDocs ? `#${id}` : `/docs#${id}`}
                className={`block py-1.5 px-2 rounded-md transition-colors ${
                  activeId === id
                    ? "text-emerald-500 font-medium bg-emerald-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
