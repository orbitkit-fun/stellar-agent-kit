const fs = require("fs");
const path = require("path");

const requiredDistDirs = [
  "packages/stellar-agent-kit/dist",
  "packages/x402-stellar-sdk/dist",
];

const missing = requiredDistDirs.filter((relativePath) => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return !fs.existsSync(fullPath);
});

if (missing.length > 0) {
  console.warn("Please run npm run build:ordered");
  console.warn("Missing dist folders:");
  for (const entry of missing) {
    console.warn(`- ${entry}`);
  }
  process.exit(1);
}
