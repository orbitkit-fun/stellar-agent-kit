/**
 * In-memory store for DevKit projects (appId registration).
 * Validate endpoint checks against this. For production, replace with a database.
 */
export type StoredProject = {
  appId: string
  name: string
  payoutWallet: string
  createdAt: string
}

const store = new Map<string, StoredProject>()

export function registerProject(project: Omit<StoredProject, "createdAt">): void {
  store.set(project.appId, {
    ...project,
    createdAt: new Date().toISOString(),
  })
}

export function isAppIdValid(appId: string | null): boolean {
  if (!appId || typeof appId !== "string") return false
  return store.has(appId.trim())
}

export function getProject(appId: string): StoredProject | undefined {
  return store.get(appId.trim())
}
