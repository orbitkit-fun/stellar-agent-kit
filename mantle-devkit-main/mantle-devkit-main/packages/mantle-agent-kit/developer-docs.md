
## Development Commands

### Build & Type Check
- `bun run build` - Build ESM + CJS + declarations via tsup
- `bun run dev` - Watch mode development
- `bun run typecheck` - Validate types (no emit)
- `bun install` - Install dependencies

## Architecture Overview

### Core Pattern
Class-based SDK. `MNTAgentKit` instance methods delegate to tool functions.

```typescript
// Agent initialization
const agent = new MNTAgentKit(privateKey, "mainnet" | "testnet" | "testnet-demo");
await agent.initialize(); // Platform validation via x402

// Agent has:
// - account: PrivateKeyAccount (viem)
// - client: WalletClient w/ publicActions + erc7811Actions
// - chain: "mainnet" | "testnet" (for address lookup)
// - demo: boolean (mock responses if true)
// - projectConfig: x402 validation data
```

### Directory Structure

**`/src/agent.ts`** - MNTAgentKit class, instance methods call tools
**`/src/tools/`** - Protocol integrations (one dir per protocol)
  - Each protocol exports operations: `swap.ts`, `supply.ts`, etc.
  - Signature: `(agent: MNTAgentKit, ...params) => Promise<Hex | Data>`

**`/src/constants/`** - Contract addresses/ABIs per protocol
  - Format: `{ mainnet: "0x...", testnet: "0x..." } as const`
  - Zero address means not deployed on that network

**`/src/utils/`** - Helper functions
  - `common/` - ERC20 approvals, allowance checks
  - `x402/` - Platform validation (APP_ID verification)
  - Protocol-specific utils (API formatting, calculations)

### Network Modes

**Mainnet** (`chain: "mainnet"`): Production, most protocols available
**Testnet** (`chain: "testnet"`): Sepolia testnet, PikePerps only
**Demo** (`testnet-demo`): Mock responses, no real txs

```typescript
if (agent.demo) return mockResponse;
const address = CONTRACT[agent.chain]; // Network-aware lookup
if (address === "0x0000...") throw new Error("Not on this network");
```

## Critical Patterns

### Tool Function Structure
```typescript
export async function protocolAction(
  agent: MNTAgentKit,
  param1: Type1,
  param2: Type2,
): Promise<Hex> {
  // 1. Demo mode check
  if (agent.demo) return DEMO_TX_HASH;

  // 2. Network availability check
  const contractAddr = CONTRACT[agent.chain];
  if (contractAddr === "0x0000...") throw new Error(...);

  // 3. Token approval (if needed)
  if (!isNative) await approveToken(agent, token, spender, amount);

  // 4. Encode + send transaction
  const data = encodeFunctionData({ abi, functionName, args });
  const hash = await agent.client.sendTransaction({ to, data, value });
  await agent.client.waitForTransactionReceipt({ hash });

  // 5. Return result
  return hash;
}
```

### Token Approval Pattern
```typescript
// From utils/common/approveToken.ts
// 1. Check existing allowance
const current = await checkAllowance(agent, token, owner, spender);
// 2. Skip if sufficient
if (current >= BigInt(amount)) return { approved: true, txHash: null };
// 3. Approve if needed
const data = encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, MAX_UINT256] });
const hash = await agent.client.sendTransaction({ to: token, data });
```

### Amount Handling
- User-facing: strings (e.g., `"1000000000000000000"` for 1 token)
- Internal: `BigInt(amount)` conversion
- Always smallest unit (wei)

### Constants Organization
```typescript
// constants/protocol/index.ts
export const CONTRACT_NAME = {
  mainnet: "0xAddress..." as const,
  testnet: "0x0000000000000000000000000000000000000000" as const,
} as const;

export const PROTOCOL_ABI = [...] as const;

export const CONFIG = {
  MAX_LEVERAGE: 100,
  DEFAULT_SLIPPAGE: 0.5,
} as const;
```

### Transaction Patterns

**Native value:**
```typescript
await agent.client.sendTransaction({
  to: contract,
  data: encodeFunctionData(...),
  value: isNative ? amountBigInt : 0n, // Include ETH/MNT value
});
```

**Event parsing:**
```typescript
const receipt = await agent.client.waitForTransactionReceipt({ hash });
for (const log of receipt.logs) {
  if (log.topics[0] === EVENT_SIGNATURE) {
    const data = decodeEventLog({ abi, data: log.data, topics: log.topics });
    // Extract event data
  }
}
// Fallback: query contract state if event missing
```

**Multi-call data queries:**
```typescript
const ids = await agent.client.readContract({ address, abi, functionName: "getIds", args: [user] });
const positions = await Promise.all(
  ids.map(id => agent.client.readContract({ address, abi, functionName: "getPosition", args: [id] }))
);
```

## Adding New Protocol Integration

1. **Create tool functions** in `/src/tools/protocol-name/`
   - `index.ts` - Export all operations
   - `action.ts` - Individual operations

2. **Create constants** in `/src/constants/protocol-name/`
   - Contract addresses (mainnet/testnet)
   - ABIs (as const arrays)
   - Protocol configs

3. **Export from indices**
   - `/src/tools/index.ts` - Export tool functions
   - `/src/constants/index.ts` - Export as `ProtocolConstants`
   - `/src/index.ts` - Export types if needed

4. **Add methods to MNTAgentKit** (`/src/agent.ts`)
   ```typescript
   async protocolAction(...params) {
     return protocolAction(this, ...params);
   }
   ```

5. **Update README.md** - Add API documentation

## Platform Validation (x402)

Required: `APP_ID` env var for platform tracking.

```typescript
await agent.initialize(); // Validates APP_ID
// Fetches: https://mantle-devkit.vercel.app/api/v1/validate?appId=...
// Validates: status === "ACTIVE"
// Stores: agent.projectConfig (appId, name, payTo, network, status)
```

Implementation: `/src/utils/x402/` - Singleton w/ promise caching.

## Dependencies

- **viem** - Blockchain interactions (wallet, contracts, encoding)
- **axios** - HTTP requests (DEX APIs, x402)
- **crypto-js** - API signing (OKX HMAC-SHA256)
- **web3** - Legacy support (minimal usage)

## Key Files

- `/src/agent.ts` - MNTAgentKit class
- `/src/index.ts` - Main export barrel
- `/tsup.config.ts` - Build config (ESM + CJS + dts)
- `/package.json` - Scripts, dependencies
- `/README.md` - Public API docs
