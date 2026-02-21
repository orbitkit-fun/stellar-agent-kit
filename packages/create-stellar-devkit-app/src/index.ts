import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import prompts from "prompts";
import ora from "ora";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = await fs.readJSON(path.join(__dirname, "../package.json"));

type ProjectType = "agent-kit" | "x402-api";
type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

function getTemplatesDir(): string {
  const candidates = [
    path.join(process.cwd(), "node_modules/create-stellar-devkit-app/templates"),
    path.join(__dirname, "../templates"),
  ];
  for (const d of candidates) {
    if (fs.existsSync(d)) return d;
  }
  throw new Error("Templates directory not found");
}

function getTemplateName(projectType: ProjectType): string {
  return projectType === "agent-kit" ? "agent-kit" : "x402-api";
}

function detectPackageManager(): PackageManager {
  if (process.env.npm_config_user_agent?.includes("yarn")) return "yarn";
  if (process.env.npm_config_user_agent?.includes("pnpm")) return "pnpm";
  if (process.env.npm_config_user_agent?.includes("bun")) return "bun";
  return "npm";
}

function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case "yarn": return "yarn";
    case "pnpm": return "pnpm install";
    case "bun": return "bun install";
    default: return "npm install";
  }
}

function getDevCommand(pm: PackageManager): string {
  switch (pm) {
    case "yarn": return "yarn dev";
    case "pnpm": return "pnpm dev";
    case "bun": return "bun dev";
    default: return "npm run dev";
  }
}

function printHeader() {
  console.log();
  console.log(chalk.cyan(`
███████╗████████╗███████╗██╗     ██╗      █████╗ ████████╗    ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
██╔════╝╚══██╔══╝██╔════╝██║     ██║     ██╔══██╗╚══██╔══╝    ██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
███████╗   ██║   █████╗  ██║     ██║     ███████║   ██║       ██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
╚════██║   ██║   ██╔══╝  ██║     ██║     ██╔══██║   ██║       ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═██╗ ██║   ██║   
███████║   ██║   ███████╗███████╗███████╗██║  ██║   ██║       ██████╔╝███████╗ ╚████╔╝ ██║  ██╗██║   ██║   
╚══════╝   ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝   ╚═╝   
`));
  console.log();
  console.log(chalk.gray("  ╭─────────────────────────────────────────────────────╮"));
  console.log(chalk.gray("  │  ") + chalk.cyan("x402 Pay-per-Request APIs") + chalk.gray("  │  ") + chalk.green("Agent Kit DeFi") + chalk.gray("    │"));
  console.log(chalk.gray("  │            ") + chalk.yellow("Powered by Stellar Network") + chalk.gray("                 │"));
  console.log(chalk.gray("  ╰─────────────────────────────────────────────────────╯"));
  console.log();
  console.log(chalk.gray(`  v${pkg.version}`));
  console.log();
}

async function main() {
  // Check for command line arguments first
  program
    .name("create-stellar-devkit-app")
    .description("Create a new Stellar DevKit project")
    .version(pkg.version)
    .argument("[project-name]", "Project name")
    .option("--agent-kit", "Use Agent Kit template (swap UI + StellarAgentKit)")
    .option("--x402-api", "Use x402 API template (payment-gated endpoints)")
    .option("--skip-install", "Skip installing dependencies")
    .parse();

  const args = program.opts();
  let projectName = program.args[0] as string | undefined;
  let projectType: ProjectType | undefined = args.agentKit ? "agent-kit" : args.x402Api ? "x402-api" : undefined;
  const skipInstall = !!args.skipInstall;

  // Determine if we should run in interactive mode
  const isInteractive = !projectName || !projectType;
  
  // If no arguments provided, show interactive interface
  if (isInteractive) {
    printHeader();
  }

  // Interactive prompts
  if (!projectType) {
    const { type } = await prompts({
      type: "select",
      name: "type",
      message: "Which SDK do you want to use?",
      choices: [
        { 
          title: chalk.green("Agent Kit"), 
          value: "agent-kit", 
          description: "5 DeFi protocols: Swap, Send, Lending, Bridge, FxDAO" 
        },
        { 
          title: chalk.cyan("x402 API"), 
          value: "x402-api", 
          description: "Payment-gated API endpoints with Stellar payments" 
        },
      ],
      initial: 0,
    });
    if (!type) process.exit(1);
    projectType = type;
  }

  const packageManager = detectPackageManager();
  let selectedPM = packageManager;
  let installDeps = !skipInstall;

  // Only prompt for package manager and install confirmation in interactive mode
  if (isInteractive) {
    const { confirmPM } = await prompts({
      type: "select",
      name: "confirmPM",
      message: "Package manager:",
      choices: [
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
        { title: "bun", value: "bun" },
      ],
      initial: ["npm", "yarn", "pnpm", "bun"].indexOf(packageManager),
    });
    selectedPM = confirmPM || packageManager;

    const { confirmInstall } = await prompts({
      type: "confirm",
      name: "confirmInstall",
      message: "Install dependencies?",
      initial: !skipInstall,
    });
    installDeps = confirmInstall;
  }

  if (!projectName) {
    const { name } = await prompts({
      type: "text",
      name: "name",
      message: "Project name:",
      initial: "my-stellar-app",
      validate: (v) => (/^[a-z0-9-_]+$/i.test(v) ? true : "Use only letters, numbers, hyphens, underscores"),
    });
    if (!name) process.exit(1);
    projectName = name;
  }

  console.log();
  console.log(chalk.blue("  Project Configuration"));
  console.log(chalk.blue("  ─────────────────────"));
  console.log(chalk.gray("  Name:      ") + chalk.white(projectName));
  console.log(chalk.gray("  Type:      ") + chalk.white(projectType === "agent-kit" ? "Agent Kit" : "x402 API"));
  console.log(chalk.gray("  Package:   ") + chalk.white(selectedPM));
  console.log();

  // Check if directory exists
  const projectPath = path.resolve(process.cwd(), projectName!);
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`✖ Directory ${projectName} already exists.`));
    process.exit(1);
  }

  // Create project
  const createSpinner = ora("Creating project...").start();
  try {
    const templatesDir = getTemplatesDir();
    const templateName = getTemplateName(projectType!);
    const templatePath = path.join(templatesDir, templateName);
    
    if (!fs.existsSync(templatePath)) {
      createSpinner.fail(`Template "${templateName}" not found`);
      process.exit(1);
    }

    fs.copySync(templatePath, projectPath);
    
    // Update package.json
    const pkgPath = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkgJson = await fs.readJSON(pkgPath);
      pkgJson.name = projectName;
      await fs.writeJSON(pkgPath, pkgJson, { spaces: 2 });
    }
    
    createSpinner.succeed("Project created!");
  } catch (error) {
    createSpinner.fail("Failed to create project");
    console.error(error);
    process.exit(1);
  }

  // Install dependencies
  if (installDeps) {
    const installSpinner = ora("Installing dependencies...").start();
    try {
      execSync(getInstallCommand(selectedPM), { 
        cwd: projectPath, 
        stdio: "pipe" 
      });
      installSpinner.succeed("Dependencies installed!");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      console.log();
      console.log(chalk.yellow("You can install them manually:"));
      console.log(chalk.gray(`  cd ${projectName}`));
      console.log(chalk.gray(`  ${getInstallCommand(selectedPM)}`));
    }
  }

  // Success message
  console.log();
  console.log(chalk.green("✔ Success!"), "Created", chalk.cyan(projectName!));
  console.log();
  console.log(chalk.blue("  Next steps:"));
  console.log();
  console.log(chalk.gray(`  1. cd ${projectName}`));
  if (!installDeps) {
    console.log(chalk.gray(`  2. ${getInstallCommand(selectedPM)}`));
    console.log(chalk.gray("  3. cp .env.example .env"));
  } else {
    console.log(chalk.gray("  2. cp .env.example .env"));
  }
  
  if (projectType === "agent-kit") {
    console.log(chalk.gray("  3. Add your PRIVATE_KEY to .env"));
    console.log(chalk.gray(`  4. ${getDevCommand(selectedPM)}`));
  } else {
    console.log(chalk.gray("  3. Add your X402_DESTINATION to .env"));
    console.log(chalk.gray(`  4. ${getDevCommand(selectedPM)}`));
  }
  
  console.log();
  console.log(chalk.blue("  Available protocols:"));
  if (projectType === "agent-kit") {
    console.log(chalk.gray("  • SoroSwap Finance - Primary DEX on Stellar"));
    console.log(chalk.gray("  • Blend - Lending & Borrowing"));
    console.log(chalk.gray("  • Reflector - Price Oracles"));
    console.log(chalk.gray("  • Allbridge Core - Cross-chain Bridge"));
    console.log(chalk.gray("  • FxDAO - Synthetic Stablecoins"));
  } else {
    console.log(chalk.gray("  • Payment-gated API endpoints"));
    console.log(chalk.gray("  • Stellar micropayments integration"));
    console.log(chalk.gray("  • x402 protocol implementation"));
  }
  console.log();
  console.log(chalk.gray("  Documentation: ") + chalk.cyan("https://stellar-agent-kit.vercel.app"));
  console.log();
}

main().catch((e) => {
  console.error(chalk.red("Error:"), e.message);
  process.exit(1);
});
