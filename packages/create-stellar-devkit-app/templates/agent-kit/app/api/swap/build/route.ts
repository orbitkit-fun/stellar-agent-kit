import { NextRequest, NextResponse } from "next/server";
import { buildSwapTransaction } from "@/app/lib/soroSwapServer";

export async function POST(request: NextRequest) {
  try {
    const { quote, fromAddress } = await request.json();
    if (!quote || !fromAddress) {
      return NextResponse.json(
        { error: "Missing: quote, fromAddress" },
        { status: 400 }
      );
    }
    const apiKey = process.env.SOROSWAP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SOROSWAP_API_KEY is required to build swap. Set it in .env." },
        { status: 500 }
      );
    }
    const { xdr } = await buildSwapTransaction(quote, fromAddress, apiKey);
    return NextResponse.json({ xdr });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build swap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
