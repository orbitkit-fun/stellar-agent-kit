#!/usr/bin/env node
/**
 * Quick test: stellar-agent-kit loads and can initialize (and optionally get a quote).
 * From repo root: npm run build && node scripts/test-sdk.mjs
 * Requires SECRET_KEY (valid Stellar mainnet secret). Set SOROSWAP_API_KEY for quote test.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "packages", "stellar-agent-kit", "dist", "index.js");
const repoRoot = join(__dirname, "..");
const SYMBOLS = {
  ok: "✔",
  err: "✖",
  info: "➜",
  skip: "⚪",
};

function printInfo(message) {
  console.log(`${SYMBOLS.info} ${message}`);
}

function printSuccess(message) {
  console.log(`${SYMBOLS.ok} ${message}`);
}

function printError(message) {
  console.error(`${SYMBOLS.err} ${message}`);
}

async function ensureDistArtifacts() {
  if (existsSync(distPath)) {
    return;
  }

  printError("Missing build");
  console.error("  Missing build artifacts. Run npm run build");

  const rl = createInterface({ input, output });
  const answer = (await rl.question("Build now? (y/n) ")).trim().toLowerCase();
  rl.close();

  if (answer === "y" || answer === "yes") {
    try {
      printInfo("Running npm run build...");
      execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
      printSuccess("Build completed");
    } catch (e) {
      printError(`Build failed: ${e?.message || String(e)}`);
      process.exit(1);
    }

    if (!existsSync(distPath)) {
      printError("Missing build");
      console.error("  Missing build artifacts. Run npm run build");
      process.exit(1);
    }
    return;
  }

  printError("Stellar Agent Kit is not built. Please run: npm run build from the repo root.");
  process.exit(1);
}

await ensureDistArtifacts();

let StellarAgentKit, MAINNET_ASSETS;
try {
  const pathToDist = pathToFileURL(distPath).href;
  const sdk = await import(pathToDist);
  StellarAgentKit = sdk.StellarAgentKit;
  MAINNET_ASSETS = sdk.MAINNET_ASSETS;
  printSuccess("SDK loaded successfully");
} catch (e) {
  const isModuleNotFound = e?.code === "ERR_MODULE_NOT_FOUND" || e?.message?.includes("Cannot find module");
  if (isModuleNotFound) {
    printError("Missing build");
    console.error("  Missing build artifacts. Run npm run build");
  } else {
    printError(`Failed to load stellar-agent-kit: ${e?.message || String(e)}`);
  }
  process.exit(1);
}

const secret = process.env.SECRET_KEY;
if (!secret) {
  printError("SECRET_KEY is required. Set it in .env or run: SECRET_KEY=your_mainnet_secret node scripts/test-sdk.mjs");
  process.exit(1);
}

async function main() {
  printInfo("Initializing StellarAgentKit...");
  const agent = new StellarAgentKit(secret, "mainnet");
  await agent.initialize();
  printSuccess("StellarAgentKit.initialize() completed");
  if (process.env.SOROSWAP_API_KEY) {
    printInfo("Fetching DEX quote (XLM -> USDC)...");
    const quote = await agent.dexGetQuote(MAINNET_ASSETS.XLM, MAINNET_ASSETS.USDC, "10000000");
    printSuccess(`dexGetQuote(XLM, USDC, 1) completed${quote?.protocol ? ` (${quote.protocol})` : ""}`);
  } else {
    console.log(`${SYMBOLS.skip} dexGetQuote skipped (set SOROSWAP_API_KEY to test)`);
  }
  printSuccess("Done. stellar-agent-kit works.");
}
main().catch((e) => {
  if (e.message && (e.message.includes("invalid encoded") || e.message.includes("decodeCheck"))) {
    printError("SECRET_KEY must be a valid Stellar secret key (S...). Check .env or the environment.");
  }
  printError(e?.message || String(e));
  process.exit(1);
});
