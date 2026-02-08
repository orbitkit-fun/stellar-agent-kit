import { NextResponse } from "next/server"
import { isAppIdValid } from "@/lib/projectStore"

/**
 * Validate a DevKit project appId. Returns valid: true only if the appId
 * was registered via POST /api/v1/projects (when user creates a project in DevKit).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const appId = searchParams.get("appId")
  const valid = isAppIdValid(appId)

  return NextResponse.json({
    valid,
    appId: appId ?? null,
    message: valid
      ? "App ID is registered."
      : "App ID not found. Create a project in DevKit and use the API endpoint shown there.",
  })
}
