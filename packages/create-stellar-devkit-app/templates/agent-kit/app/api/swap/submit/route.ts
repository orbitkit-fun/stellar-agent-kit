import { NextRequest, NextResponse } from "next/server";
import { submitSignedTransaction } from "@/app/lib/soroSwapServer";

export async function POST(request: NextRequest) {
  try {
    const { signedXdr } = await request.json();
    if (!signedXdr) {
      return NextResponse.json(
        { error: "Missing: signedXdr" },
        { status: 400 }
      );
    }
    const result = await submitSignedTransaction(signedXdr);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit swap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
