export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatHistory = {
  messages: ChatMessage[]
  lastActivityAt: number
}

const STORAGE_KEY = "agent_chat_history"
export const CHAT_HISTORY_TTL_MS = 24 * 60 * 60 * 1000

const FALLBACK_MESSAGE_LIMITS = [500, 200, 100]

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage

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
