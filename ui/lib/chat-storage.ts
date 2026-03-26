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

// Async variant for future API/database-backed storage.
export interface AsyncChatStorage {
  load(): Promise<ChatMessage[]>
  save(messages: ChatMessage[]): Promise<void>
  clear(): Promise<void>
}

/**
 * Placeholder for remote (API/db) chat storage.
 *
 * This is intentionally a stub:
 * - Simulates async behavior so callers can be wired with await.
 * - Real implementation should call your backend (REST, RPC, Supabase, etc.).
 */
export class RemoteChatStorage implements AsyncChatStorage {
  /**
   * Optional base URL or identifier for the remote storage backend.
   * Replace this with your actual API endpoint or client as needed.
   */
  constructor(private readonly endpoint: string = "/api/agent/chat-storage") {}

  async load(): Promise<ChatMessage[]> {
    // TODO: Replace with real API call, e.g. fetch(this.endpoint).
    // Simulate network latency so consumers can be written as async.
    await simulateLatency()
    return []
  }

  async save(_messages: ChatMessage[]): Promise<void> {
    // TODO: Send messages to remote API/database.
    // Example (future): await fetch(this.endpoint, { method: "POST", body: JSON.stringify({ messages }) })
    await simulateLatency()
  }

  async clear(): Promise<void> {
    // TODO: Implement remote clear/delete for the given session.
    await simulateLatency()
  }
}

async function simulateLatency(durationMs = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}
