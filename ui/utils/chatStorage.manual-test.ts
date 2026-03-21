import { CHAT_HISTORY_TTL_MS, loadChatHistory, saveChatHistory, type ChatMessage } from "@/utils/chatStorage"

const STORAGE_KEY = "agent_chat_history"

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message)
  }
}

const clearStorage = (): void => {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function testSaveAndLoadMessages(): void {
  clearStorage()

  const messages: ChatMessage[] = [
    { role: "user", content: "hello" },
    { role: "assistant", content: "hi" },
  ]

  saveChatHistory(messages)
  const loaded = loadChatHistory()

  assert(loaded.length === 2, "Expected 2 messages after load")
  assert(loaded[0]?.content === "hello", "Expected first message content to match")
  assert(loaded[1]?.content === "hi", "Expected second message content to match")
}

export function testExpiredTtlRemovesData(): void {
  clearStorage()

  const expiredPayload = {
    messages: [{ role: "user", content: "stale" }],
    lastActivityAt: Date.now() - CHAT_HISTORY_TTL_MS - 1,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expiredPayload))
  const loaded = loadChatHistory()

  assert(loaded.length === 0, "Expected no messages for expired history")
  assert(window.localStorage.getItem(STORAGE_KEY) === null, "Expected expired data to be removed")
}

export function testCorruptJsonHandledSafely(): void {
  clearStorage()

  window.localStorage.setItem(STORAGE_KEY, "{bad-json")
  const loaded = loadChatHistory()

  assert(loaded.length === 0, "Expected no messages for corrupt JSON")
  assert(window.localStorage.getItem(STORAGE_KEY) === null, "Expected corrupt payload to be removed")
}

export function testMessagesPersistAfterReloadSimulation(): void {
  clearStorage()

  const messages: ChatMessage[] = [{ role: "user", content: "persist me" }]
  saveChatHistory(messages)

  const firstLoad = loadChatHistory()
  const secondLoad = loadChatHistory()

  assert(firstLoad.length === 1, "Expected first load to return one message")
  assert(secondLoad.length === 1, "Expected second load to return one message")
  assert(secondLoad[0]?.content === "persist me", "Expected message content to persist")
}

export function runAllChatStorageManualTests(): string {
  testSaveAndLoadMessages()
  testExpiredTtlRemovesData()
  testCorruptJsonHandledSafely()
  testMessagesPersistAfterReloadSimulation()
  return "All chat storage manual tests passed"
}
