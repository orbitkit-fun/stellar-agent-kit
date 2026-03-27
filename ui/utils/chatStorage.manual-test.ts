import {
  CHAT_HISTORY_TTL_MS,
  loadChatHistory,
  saveChatHistory,
  LocalStorageChatStorage,
  RemoteChatStorage,
  type ChatMessage,
  type ChatStorage,
} from "./chatStorage"

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

export function testSessionIsolation(): void {
  const sessionAKey = "agent_chat_history_session-a"
  const sessionBKey = "agent_chat_history_session-b"
  window.localStorage.removeItem(sessionAKey)
  window.localStorage.removeItem(sessionBKey)

  const storage = new LocalStorageChatStorage()

  const sessionA = "session-a"
  const sessionB = "session-b"

  const messagesA: ChatMessage[] = [{ role: "user", content: "from A" }]
  const messagesB: ChatMessage[] = [{ role: "assistant", content: "from B" }]

  storage.save(sessionA, messagesA)
  storage.save(sessionB, messagesB)

  const loadedA = storage.load(sessionA)
  const loadedB = storage.load(sessionB)

  assert(loadedA.length === 1, "Expected session A to have one message")
  assert(loadedB.length === 1, "Expected session B to have one message")
  assert(loadedA[0]?.content === "from A", "Expected session A content to match")
  assert(loadedB[0]?.content === "from B", "Expected session B content to match")
}

export function testChatStorageAbstraction(): void {
  const sessionId = "abstraction-test"
  const key = `agent_chat_history_${sessionId}`
  window.localStorage.removeItem(key)

  const useStorage = (storage: ChatStorage): ChatMessage[] => {
    const messages: ChatMessage[] = [{ role: "user", content: "hello abstraction" }]
    storage.save(sessionId, messages)
    return storage.load(sessionId)
  }

  const localResult = useStorage(new LocalStorageChatStorage())
  assert(localResult.length === 1, "Expected LocalStorageChatStorage to round-trip one message")
  assert(
    localResult[0]?.content === "hello abstraction",
    "Expected LocalStorageChatStorage to preserve content through ChatStorage interface",
  )

  const remoteStorage: ChatStorage = new RemoteChatStorage()
  const remoteResult = remoteStorage.load("remote-session")
  assert(Array.isArray(remoteResult), "Expected RemoteChatStorage.load to return an array")
  assert(remoteResult.length === 0, "Expected RemoteChatStorage stub to return empty history")
}

export function testMultiTabSimulation(): void {
  const sessionId = "multi-tab-session"
  const key = `agent_chat_history_${sessionId}`
  window.localStorage.removeItem(key)

  const tab1 = new LocalStorageChatStorage()
  const tab2 = new LocalStorageChatStorage()

  const initialMessages: ChatMessage[] = [{ role: "user", content: "from tab1" }]
  tab1.save(sessionId, initialMessages)

  const loadedInTab2First = tab2.load(sessionId)
  assert(
    loadedInTab2First.length === 1 && loadedInTab2First[0]?.content === "from tab1",
    "Expected second tab to see messages saved by first tab",
  )

  const updatedMessages: ChatMessage[] = [
    ...loadedInTab2First,
    { role: "assistant", content: "reply from tab2" },
  ]
  tab2.save(sessionId, updatedMessages)

  const loadedInTab1Second = tab1.load(sessionId)
  assert(
    loadedInTab1Second.length === 2 &&
      loadedInTab1Second[0]?.content === "from tab1" &&
      loadedInTab1Second[1]?.content === "reply from tab2",
    "Expected first tab to see updates saved by second tab",
  )
}

export function runAllChatStorageManualTests(): string {
  testSaveAndLoadMessages()
  testExpiredTtlRemovesData()
  testCorruptJsonHandledSafely()
  testMessagesPersistAfterReloadSimulation()
   testSessionIsolation()
   testChatStorageAbstraction()
   testMultiTabSimulation()
  return "All chat storage manual tests passed"
}
