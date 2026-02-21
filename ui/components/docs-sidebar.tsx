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
    <aside className="w-64 shrink-0 hidden md:block border-r border-zinc-800 bg-black self-stretch flex flex-col min-h-screen">
      <nav className="flex-1 min-h-0 overflow-y-auto pt-28 pb-6 pl-5 pr-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">On this page</p>
        <ul className="space-y-1 text-sm">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={isDocs ? `#${id}` : `/docs#${id}`}
                className={`block py-1.5 px-2 rounded-md transition-colors ${
                  activeId === id
                    ? "text-zinc-200 font-medium bg-zinc-800/50"
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
