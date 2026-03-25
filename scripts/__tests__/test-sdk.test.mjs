import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const sourceScriptPath = join(process.cwd(), "scripts", "test-sdk.mjs");
const sourceScript = readFileSync(sourceScriptPath, "utf8");

function createTempRepo() {
  const root = mkdtempSync(join(tmpdir(), "stellar-agent-kit-script-test-"));
  const scriptsDir = join(root, "scripts");
  mkdirSync(scriptsDir, { recursive: true });
  writeFileSync(join(scriptsDir, "test-sdk.mjs"), sourceScript, "utf8");
  return root;
}

function createDistFile(root, content) {
  const distDir = join(root, "packages", "stellar-agent-kit", "dist");
  mkdirSync(distDir, { recursive: true });
  writeFileSync(join(distDir, "index.js"), content, "utf8");
}

function runScript(root, { input = "", env = {} } = {}) {
  return spawnSync(process.execPath, [join(root, "scripts", "test-sdk.mjs")], {
    cwd: root,
    env: { ...process.env, ...env },
    input,
    encoding: "utf8",
  });
}

function outputOf(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

const sdkModuleContent = `
export class StellarAgentKit {
  constructor(secret, network) {
    this.secret = secret;
    this.network = network;
  }

  async initialize() {}

  async dexGetQuote() {
    return { protocol: "stub" };
  }
}

export const MAINNET_ASSETS = {
  XLM: { code: "XLM" },
  USDC: { code: "USDC" },
};
`;

function assertNoRawCrash(output) {
  assert.ok(!output.includes("Unhandled"), "Expected no unhandled crash output");
  assert.ok(!output.includes("\n    at "), "Expected no raw stack trace output");
}

test("dist exists -> script runs successfully", () => {
  const root = createTempRepo();
  try {
    createDistFile(root, sdkModuleContent);
    const result = runScript(root, { env: { SECRET_KEY: "S_TEST_KEY" } });
    const output = outputOf(result);

    assert.equal(result.status, 0, output);
    assert.match(output, /✔ SDK loaded successfully/);
    assert.match(output, /✔ Done\. stellar-agent-kit works\./);
    assertNoRawCrash(output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dist missing -> error message shown", () => {
  const root = createTempRepo();
  try {
    const result = runScript(root, { input: "n\n" });
    const output = outputOf(result);

    assert.equal(result.status, 1, output);
    assert.match(output, /✖ Missing build/);
    assert.match(output, /Build now\? \(y\/n\)/);
    assertNoRawCrash(output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("user chooses auto-build -> script recovers", () => {
  const root = createTempRepo();
  try {
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify(
        {
          name: "temp-test-repo",
          private: true,
          type: "module",
          scripts: {
            build: "node build.mjs",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    writeFileSync(
      join(root, "build.mjs"),
      `
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "packages", "stellar-agent-kit", "dist");
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, "index.js"), ${JSON.stringify(sdkModuleContent)}, "utf8");
`,
      "utf8",
    );

    const result = runScript(root, { input: "y\n", env: { SECRET_KEY: "S_TEST_KEY" } });
    const output = outputOf(result);

    assert.equal(result.status, 0, output);
    assert.match(output, /➜ Running npm run build\.\.\./);
    assert.match(output, /✔ Build completed/);
    assert.match(output, /✔ SDK loaded successfully/);
    assertNoRawCrash(output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("invalid dist path target -> handled gracefully", () => {
  const root = createTempRepo();
  try {
    const invalidDistPath = join(root, "packages", "stellar-agent-kit", "dist", "index.js");
    mkdirSync(invalidDistPath, { recursive: true });

    const result = runScript(root, { env: { SECRET_KEY: "S_TEST_KEY" } });
    const output = outputOf(result);

    assert.equal(result.status, 1, output);
    assert.match(output, /✖ Failed to load stellar-agent-kit:/);
    assertNoRawCrash(output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
