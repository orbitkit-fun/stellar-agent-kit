import { NextResponse } from "next/server"
import { registerProject } from "@/lib/projectStore"

/**
 * Register a DevKit project so the validate endpoint can verify its appId.
 * Called by the DevKit UI when the user creates a project.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, appId, payoutWallet } = body ?? {}

    if (!appId || typeof appId !== "string" || appId.length < 8) {
      return NextResponse.json(
        { error: "Invalid appId; required non-empty string (min 8 chars)." },
        { status: 400 }
      )
    }

    registerProject({
      name: typeof name === "string" ? name.trim() || "My Project" : "My Project",
      appId: appId.trim(),
      payoutWallet: typeof payoutWallet === "string" ? payoutWallet.trim() : "",
    })

    return NextResponse.json({ ok: true, appId: appId.trim() })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
