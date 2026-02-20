#!/usr/bin/env node
#!/usr/bin/env node

// src/index.ts
import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import prompts from "prompts";
var pkg = await fs.readJSON(path.join(path.dirname(new URL(import.meta.url).pathname), "../package.json"));
function getTemplatesDir() {
  const candidates = [
    path.join(process.cwd(), "node_modules/create-stellar-devkit-app/templates"),
    path.join(path.dirname(new URL(import.meta.url).pathname), "../templates")
  ];
  for (const d of candidates) {
    if (fs.existsSync(d)) return d;
  }
  throw new Error("Templates directory not found");
}
function getTemplateName(projectType) {
  return projectType === "agent-kit" ? "agent-kit" : "x402-api";
}
async function main() {
  console.log();
  console.log(chalk.bold.cyan("  Stellar DevKit"));
  console.log(chalk.gray("  Agent Kit DeFi  \u2022  x402 Pay-per-Request APIs"));
  console.log(chalk.gray(`  v${pkg.version}`));
  console.log();
  program.name("create-stellar-devkit-app").description("Create a new Stellar DevKit project").version(pkg.version).argument("[project-name]", "Project name").option("--agent-kit", "Use Agent Kit template (swap UI + StellarAgentKit)").option("--x402-api", "Use x402 API template (payment-gated endpoints)").option("--skip-install", "Skip installing dependencies").parse();
  const args = program.opts();
  let projectName = program.args[0];
  let projectType = args.agentKit ? "agent-kit" : args.x402Api ? "x402-api" : void 0;
  const skipInstall = !!args.skipInstall;
  if (!projectName) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name?",
      initial: "my-stellar-app",
      validate: (v) => /^[a-z0-9-_]+$/i.test(v) ? true : "Use only letters, numbers, hyphens, underscores"
    });
    projectName = name;
  }
  if (!projectType) {
    const { type } = await prompts({
      type: "select",
      name: "type",
      message: "Which template?",
      choices: [
        { title: chalk.green("Agent Kit"), value: "agent-kit", description: "Swap UI + StellarAgentKit" },
        { title: chalk.cyan("x402 API"), value: "x402-api", description: "Payment-gated API with Stellar" }
      ],
      initial: 0
    });
    projectType = type;
  }
  const projectPath = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Directory ${projectName} already exists.`));
    process.exit(1);
  }
  const templatesDir = getTemplatesDir();
  const templateName = getTemplateName(projectType);
  const templatePath = path.join(templatesDir, templateName);
  if (!fs.existsSync(templatePath)) {
    console.log(chalk.yellow(`Template "${templateName}" not found. Available: ${fs.readdirSync(templatesDir).join(", ")}`));
    process.exit(1);
  }
  fs.copySync(templatePath, projectPath);
  const pkgPath = path.join(projectPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkgJson = await fs.readJSON(pkgPath);
    pkgJson.name = projectName;
    await fs.writeJSON(pkgPath, pkgJson, { spaces: 2 });
  }
  if (!skipInstall) {
    try {
      execSync("npm install", { cwd: projectPath, stdio: "inherit" });
    } catch {
      console.log(chalk.yellow("Install failed. Run manually: cd " + projectName + " && npm install"));
    }
  }
  console.log();
  console.log(chalk.green.bold("\u2714 Success!"), "Created", chalk.cyan(projectName));
  console.log(chalk.gray("  cd " + projectName));
  if (skipInstall) console.log(chalk.gray("  npm install"));
  if (projectType === "agent-kit") {
    console.log(chalk.gray("  cp .env.example .env  # add SECRET_KEY, SOROSWAP_API_KEY"));
  } else {
    console.log(chalk.gray("  cp .env.example .env  # add X402_DESTINATION (your G... address)"));
  }
  console.log(chalk.gray("  npm run dev"));
  console.log();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
