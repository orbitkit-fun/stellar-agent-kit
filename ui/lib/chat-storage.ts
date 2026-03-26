export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export interface ChatStorage {
  load(): ChatMessage[]
  save(messages: ChatMessage[]): void
  clear(): void
}

const DEFAULT_STORAGE_KEY = "stellar_agent_chat_messages"

export class LocalStorageChatStorage implements ChatStorage {
  private readonly storageKey: string

  constructor(storageKey: string = DEFAULT_STORAGE_KEY) {
    this.storageKey = storageKey
  }

  load(): ChatMessage[] {
    if (typeof window === "undefined" || !("localStorage" in window)) return []
    try {
      const raw = window.localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((m): m is ChatMessage => {
        return (
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
        )
      })
    } catch {
      return []
    }
  }

  save(messages: ChatMessage[]): void {
    if (typeof window === "undefined" || !("localStorage" in window)) return
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(messages))
    } catch {
      // Swallow storage errors (e.g., quota exceeded, private mode)
    }
  }

  clear(): void {
    if (typeof window === "undefined" || !("localStorage" in window)) return
    try {
      window.localStorage.removeItem(this.storageKey)
    } catch {
      // Ignore storage errors
    }
  }
}
