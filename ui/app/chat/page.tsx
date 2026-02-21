"use client"

import { Navbar } from "@/components/navbar"
import { AgentChat } from "@/components/agent-chat"

export default function ChatPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />

      {/* Chat content */}
      <div className="relative z-20 flex flex-col items-center min-h-screen pt-20 pb-8 px-4 sm:px-6">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl">
          <AgentChat />
        </div>
      </div>
    </main>
  )
}
