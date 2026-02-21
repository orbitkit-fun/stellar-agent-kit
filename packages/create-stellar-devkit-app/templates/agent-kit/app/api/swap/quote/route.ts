import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/app/lib/soroSwapServer";

export async function POST(request: NextRequest) {
  try {
    const { fromAsset, toAsset, amount } = await request.json();
    if (!fromAsset || !toAsset || amount == null || amount === "") {
      return NextResponse.json(
        { error: "Missing: fromAsset, toAsset, amount" },
        { status: 400 }
      );
    }
    const quote = await getQuote(fromAsset, toAsset, String(amount));
    return NextResponse.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get quote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
