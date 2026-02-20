import { type Hex } from "viem";

export const DEMO_TX_HASH =
  "0xdemo000000000000000000000000000000000000000000000000000000000001" as Hex;

export function createMockSwapResponse(protocol: string, inputAmount: string) {
  return {
    txHash: DEMO_TX_HASH,
    amountOut: inputAmount,
    demo: true,
    message: `[DEMO] ${protocol} swap simulated`,
  };
}

export function createMockQuoteResponse(protocol: string, inputAmount: string) {
  return {
    estimatedAmount: inputAmount,
    demo: true,
    message: `[DEMO] ${protocol} quote simulated`,
  };
}

export function createMockLendleResponse(action: string, amount: string) {
  return {
    txHash: DEMO_TX_HASH,
    amount: amount,
    demo: true,
    message: `[DEMO] Lendle ${action} simulated`,
  };
}

export function createMockTxHash(): Hex {
  return DEMO_TX_HASH;
}

export function createMockOkxSwapResponse(inputAmount: string) {
  return {
    data: DEMO_TX_HASH,
    demo: true,
    message: "[DEMO] OKX swap simulated",
  };
}

export function createMockOpenOceanSwapResponse(inputAmount: string) {
  return {
    txHash: DEMO_TX_HASH as string,
    outAmount: inputAmount,
    demo: true,
    message: "[DEMO] OpenOcean swap simulated",
  };
}

export function createMockUniswapSwapResponse(inputAmount: string) {
  return {
    txHash: DEMO_TX_HASH as string,
    amountOut: inputAmount,
    demo: true,
    message: "[DEMO] Uniswap swap simulated",
  };
}

export function createMockSquidRoute(amount: string) {
  return {
    route: {
      estimate: { toAmount: amount },
      transactionRequest: {
        targetAddress: "0x0000000000000000000000000000000000000000",
        data: "0x",
        value: "0",
        gasLimit: "0",
      },
    },
    demo: true,
    message: "[DEMO] Squid route simulated",
  };
}
