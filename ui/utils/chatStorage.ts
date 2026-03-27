export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatHistory = {
  messages: ChatMessage[]
  lastActivityAt: number
}
export const STORAGE_KEY = "agent_chat_history"
export const CHAT_HISTORY_TTL_MS = 24 * 60 * 60 * 1000
const SESSION_ID_STORAGE_KEY = "agent_chat_session_id"

export interface ChatStorage {
  load(sessionId: string): ChatMessage[]
  save(sessionId: string, messages: ChatMessage[]): void
  clear(sessionId: string): void
}

export class LocalStorageChatStorage implements ChatStorage {
  private getStorageKey(sessionId: string): string {
    return `agent_chat_history_${sessionId}`
  }

  save(sessionId: string, messages: ChatMessage[]): void {
    if (!canUseStorage()) return

    const normalizedMessages = normalizeMessages(messages)
    const storageKey = this.getStorageKey(sessionId)

    const baseHistory: ChatHistory = {
      messages: normalizedMessages,
      lastActivityAt: Date.now(),
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(baseHistory))
      return
    } catch {
    }

    for (const limit of FALLBACK_MESSAGE_LIMITS) {
      const truncatedMessages = normalizedMessages.slice(-limit)
      const fallbackHistory: ChatHistory = {
        messages: truncatedMessages,
        lastActivityAt: baseHistory.lastActivityAt,
      }

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(fallbackHistory))
        return
      } catch {
      }
    }

    try {
      window.localStorage.removeItem(storageKey)
    } catch {
    }
  }

  load(sessionId: string): ChatMessage[] {
    if (!canUseStorage()) return []

    const storageKey = this.getStorageKey(sessionId)
    const rawHistory = window.localStorage.getItem(storageKey)
    if (!rawHistory) return []

    let parsedHistory: unknown
    try {
      parsedHistory = JSON.parse(rawHistory)
    } catch {
      try {
        window.localStorage.removeItem(storageKey)
      } catch {
      }
      return []
    }

    if (typeof parsedHistory !== "object" || parsedHistory === null) {
      try {
        window.localStorage.removeItem(storageKey)
      } catch {
      }
      return []
    }

    const historyCandidate = parsedHistory as {
      messages?: unknown
      lastActivityAt?: unknown
    }

    const lastActivityAt =
      typeof historyCandidate.lastActivityAt === "number"
        ? historyCandidate.lastActivityAt
        : Number.NaN

    if (!Number.isFinite(lastActivityAt) || Date.now() - lastActivityAt >= CHAT_HISTORY_TTL_MS) {
      try {
        window.localStorage.removeItem(storageKey)
      } catch {
      }
      return []
    }

    return normalizeMessages(historyCandidate.messages)
  }

  clear(sessionId: string): void {
    if (!canUseStorage()) return

    const storageKey = this.getStorageKey(sessionId)
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
    }
  }
}

export class RemoteChatStorage implements ChatStorage {
  load(_sessionId: string): ChatMessage[] {
    // Placeholder for future remote API-backed implementation
    return []
  }

  save(_sessionId: string, _messages: ChatMessage[]): void {
    // Placeholder for future remote API-backed implementation
  }

  clear(_sessionId: string): void {
    // Placeholder for future remote API-backed implementation
  }
}

const FALLBACK_MESSAGE_LIMITS = [500, 200, 100]

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage

export const getOrCreateSessionId = (): string | null => {
  if (!canUseStorage()) return null

  try {
    const existing = window.localStorage.getItem(SESSION_ID_STORAGE_KEY)
    if (existing && typeof existing === "string" && existing.length > 0) {
      return existing
    }

    if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
      return null
    }

    const nextId = crypto.randomUUID()
    window.localStorage.setItem(SESSION_ID_STORAGE_KEY, nextId)
    return nextId
  } catch {
    return null
  }
}

const normalizeMessages = (messages: unknown): ChatMessage[] => {
  if (!Array.isArray(messages)) return []

  return messages
    .filter(
      (message): message is ChatMessage =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        ((message as { role?: unknown }).role === "user" ||
          (message as { role?: unknown }).role === "assistant") &&
        typeof (message as { content?: unknown }).content === "string",
    )
    .map((message) => ({ role: message.role, content: message.content }))
}

const writeHistory = (history: ChatHistory): boolean => {
  if (!canUseStorage()) return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch {
    return false
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (!canUseStorage()) return

  const normalizedMessages = normalizeMessages(messages)
  const baseHistory: ChatHistory = {
    messages: normalizedMessages,
    lastActivityAt: Date.now(),
  }

  if (writeHistory(baseHistory)) return

  for (const limit of FALLBACK_MESSAGE_LIMITS) {
    const truncatedMessages = normalizedMessages.slice(-limit)
    const fallbackHistory: ChatHistory = {
      messages: truncatedMessages,
      lastActivityAt: baseHistory.lastActivityAt,
    }

    if (writeHistory(fallbackHistory)) return
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

export function loadChatHistory(): ChatMessage[] {
  if (!canUseStorage()) return []

  const rawHistory = window.localStorage.getItem(STORAGE_KEY)
  if (!rawHistory) return []

  let parsedHistory: unknown
  try {
    parsedHistory = JSON.parse(rawHistory)
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
    return []
  }

  if (typeof parsedHistory !== "object" || parsedHistory === null) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
    return []
  }

  const historyCandidate = parsedHistory as {
    messages?: unknown
    lastActivityAt?: unknown
  }

  const lastActivityAt =
    typeof historyCandidate.lastActivityAt === "number"
      ? historyCandidate.lastActivityAt
      : Number.NaN

  if (!Number.isFinite(lastActivityAt) || Date.now() - lastActivityAt >= CHAT_HISTORY_TTL_MS) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
    return []
  }

  return normalizeMessages(historyCandidate.messages)
}
