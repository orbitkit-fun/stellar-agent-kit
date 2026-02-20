import { NextResponse } from "next/server";
import { StellarAgentKit, MAINNET_ASSETS } from "stellar-agent-kit";

export async function GET() {
  const secretKey = process.env.SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Set SECRET_KEY in .env" },
      { status: 500 }
    );
  }

  try {
    const agent = new StellarAgentKit(secretKey, "mainnet");
    await agent.initialize();

    const quote = await agent.dexGetQuote(
      { contractId: MAINNET_ASSETS.XLM.contractId },
      { contractId: MAINNET_ASSETS.USDC.contractId },
      "10000000" // 1 XLM (7 decimals)
    );

    return NextResponse.json({
      amountIn: quote.expectedIn,
      amountOut: quote.expectedOut,
      minOut: quote.minOut,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Quote failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
