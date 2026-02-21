import { NextRequest, NextResponse } from "next/server";
import { TransactionBuilder, Networks, Horizon } from "@stellar/stellar-sdk";
import { getNetworkConfig } from "stellar-agent-kit";

export async function POST(request: NextRequest) {
  try {
    const { signedXdr } = await request.json();
    if (!signedXdr) {
      return NextResponse.json(
        { error: "Missing: signedXdr" },
        { status: 400 }
      );
    }
    const config = getNetworkConfig();
    const horizon = new Horizon.Server(config.horizonUrl);
    const networkPassphrase = Networks.PUBLIC;
    const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await horizon.submitTransaction(tx);
    return NextResponse.json({
      hash: result.hash,
      status: result.successful ? "SUCCESS" : "PENDING",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
