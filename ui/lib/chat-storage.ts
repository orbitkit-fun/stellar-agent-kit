export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export interface ChatStorage {
  load(): ChatMessage[]
  save(messages: ChatMessage[]): void
  clear(): void
}

const SESSION_ID_KEY = "agent_chat_session_id"

export function getOrCreateChatSessionId(): string {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    // Fallback: ephemeral ID
    return generateRandomId()
  }

  const existing = window.localStorage.getItem(SESSION_ID_KEY)
  if (existing && existing.length > 0) return existing

  const id = generateRandomId()
  try {
    window.localStorage.setItem(SESSION_ID_KEY, id)
  } catch {
    // Ignore storage errors; caller can still use the in-memory ID
  }
  return id
}

function generateRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  // Basic fallback if randomUUID is unavailable
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export class LocalStorageChatStorage implements ChatStorage {
  private readonly storageKey: string

  constructor(sessionId: string) {
    this.storageKey = `agent_chat_history_${sessionId}`
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
