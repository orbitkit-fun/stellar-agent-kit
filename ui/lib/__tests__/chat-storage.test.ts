import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  LocalStorageChatStorage,
  RemoteChatStorage,
  getOrCreateChatSessionId,
  getChatStorageKey,
  type ChatMessage,
} from "../chat-storage"

function createMockLocalStorage() {
  const store = new Map<string, string>()

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
    _store: store,
  }
}

declare const global: any

describe("chat-storage abstraction", () => {
  beforeEach(() => {
    const mockLocalStorage = createMockLocalStorage()
    ;(global as any).window = { localStorage: mockLocalStorage }
  })

  it("generates and reuses a sessionId via getOrCreateChatSessionId", () => {
    const first = getOrCreateChatSessionId()
    const second = getOrCreateChatSessionId()

    expect(first).toBeTruthy()
    expect(second).toBe(first)

    const ls = (global as any).window.localStorage
    expect(ls.setItem).toHaveBeenCalledWith("agent_chat_session_id", first)
  })

  it("uses a per-session key for LocalStorageChatStorage", () => {
    const sessionId = "session-123"
    const storage = new LocalStorageChatStorage(sessionId)
    const messages: ChatMessage[] = [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]

    storage.save(messages)

    const key = getChatStorageKey(sessionId)
    const ls = (global as any).window.localStorage
    expect(ls.setItem).toHaveBeenCalledWith(key, JSON.stringify(messages))

    // Simulate another tab writing different messages and ensure we read them back
    const nextMessages: ChatMessage[] = [{ role: "user", content: "next" }]
    ls.setItem.mock.calls = []
    ls.getItem.mockImplementation((k: string) =>
      k === key ? JSON.stringify(nextMessages) : null
    )

    const loaded = storage.load()
    expect(loaded).toEqual(nextMessages)
  })

  it("handles malformed JSON in storage without throwing", () => {
    const sessionId = "broken-session"
    const key = getChatStorageKey(sessionId)
    const storage = new LocalStorageChatStorage(sessionId)
    const ls = (global as any).window.localStorage

    ls.getItem.mockImplementation((k: string) => (k === key ? "{not-json" : null))

    const loaded = storage.load()
    expect(loaded).toEqual([])
  })

  it("falls back safely when localStorage access throws", () => {
    const throwingWindow: any = {}
    Object.defineProperty(throwingWindow, "localStorage", {
      get() {
        throw new Error("blocked")
      },
    })
    ;(global as any).window = throwingWindow

    const id = getOrCreateChatSessionId()
    expect(id).toBeTruthy()

    const storage = new LocalStorageChatStorage("abc")
    expect(storage.load()).toEqual([])
    // save/clear should be no-ops and not throw
    expect(() => storage.save([{ role: "user", content: "x" }])).not.toThrow()
    expect(() => storage.clear()).not.toThrow()
  })

  it("simulates multi-tab behavior via shared LocalStorageChatStorage", () => {
    const sessionId = getOrCreateChatSessionId()
    const tabA = new LocalStorageChatStorage(sessionId)
    const tabB = new LocalStorageChatStorage(sessionId)
    const key = getChatStorageKey(sessionId)
    const ls = (global as any).window.localStorage

    const messagesA: ChatMessage[] = [{ role: "user", content: "from A" }]
    tabA.save(messagesA)

    // Other \"tab\" should see the same data when it reloads from localStorage
    ls.getItem.mockImplementation((k: string) =>
      k === key ? JSON.stringify(messagesA) : null
    )
    const loadedByB = tabB.load()
    expect(loadedByB).toEqual(messagesA)
  })

  it("RemoteChatStorage stub behaves as async no-op", async () => {
    const remote = new RemoteChatStorage("/fake-endpoint")

    const loaded = await remote.load()
    expect(loaded).toEqual([])

    await expect(remote.save([{ role: "user", content: "hi" }])).resolves.toBeUndefined()
    await expect(remote.clear()).resolves.toBeUndefined()
  })
})
