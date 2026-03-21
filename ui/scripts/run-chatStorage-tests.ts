const store = new Map<string, string>()

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value))
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    },
  },
  configurable: true,
})

async function run() {
  const tests = await import("../utils/chatStorage.manual-test")
  const runAll =
    tests.runAllChatStorageManualTests ??
    (tests.default as { runAllChatStorageManualTests?: (() => string) | undefined } | undefined)
      ?.runAllChatStorageManualTests

  if (typeof runAll !== "function") {
    throw new Error("runAllChatStorageManualTests export not found")
  }

  const result = runAll()
  console.log(result)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
