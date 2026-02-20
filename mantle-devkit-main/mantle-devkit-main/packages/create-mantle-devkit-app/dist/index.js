#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// package.json
var require_package = __commonJS({
  "package.json"(exports2, module2) {
    module2.exports = {
      name: "create-mantle-devkit-app",
      version: "0.2.0",
      description: "Create a new Mantle DevKit project - x402 APIs or Agent Kit DeFi apps",
      keywords: [
        "x402",
        "http-402",
        "payment",
        "api",
        "mantle",
        "web3",
        "blockchain",
        "agent-kit",
        "defi",
        "swap",
        "create",
        "cli",
        "boilerplate",
        "starter"
      ],
      author: "debanjannnn",
      license: "MIT",
      repository: {
        type: "git",
        url: "git+https://github.com/Debanjannnn/mantle-devkit.git"
      },
      homepage: "https://mantle-devkit.vercel.app",
      bin: {
        "create-mantle-devkit-app": "./dist/index.js"
      },
      files: [
        "dist",
        "templates"
      ],
      scripts: {
        build: "tsup",
        dev: "tsup --watch",
        prepublishOnly: "npm run build"
      },
      dependencies: {
        "@types/figlet": "^1.7.0",
        chalk: "^5.3.0",
        commander: "^12.1.0",
        figlet: "^1.9.4",
        "fs-extra": "^11.2.0",
        ora: "^8.0.1",
        prompts: "^2.4.2"
      },
      devDependencies: {
        "@types/fs-extra": "^11.0.4",
        "@types/node": "^20.0.0",
        "@types/prompts": "^2.4.9",
        tsup: "^8.0.0",
        typescript: "^5.0.0"
      }
    };
  }
});

// src/index.ts
var import_commander = require("commander");
var import_chalk = __toESM(require("chalk"));
var import_ora = __toESM(require("ora"));
var import_prompts = __toESM(require("prompts"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_child_process = require("child_process");
var import_figlet = __toESM(require("figlet"));
var packageJson = require_package();
function getTemplateDir(projectType, framework) {
  if (projectType === "agent-kit") {
    return "agent-kit";
  }
  const type = projectType === "x402-fullstack" ? "fullstack" : "backend";
  return `${type}-${framework}`;
}
function getTemplatesDirectory() {
  const possiblePaths = [
    import_path.default.join(__dirname, "..", "templates"),
    import_path.default.join(__dirname, "templates")
  ];
  for (const templatePath of possiblePaths) {
    if (import_fs_extra.default.existsSync(templatePath)) {
      return templatePath;
    }
  }
  let currentDir = __dirname;
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const pkgPath = import_path.default.join(currentDir, "package.json");
    if (import_fs_extra.default.existsSync(pkgPath)) {
      try {
        const pkg = import_fs_extra.default.readJsonSync(pkgPath);
        if (pkg.name === "create-mantle-devkit-app") {
          const templatesPath = import_path.default.join(currentDir, "templates");
          if (import_fs_extra.default.existsSync(templatesPath)) {
            return templatesPath;
          }
        }
      } catch (e) {
      }
    }
    const parentDir = import_path.default.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
    attempts++;
  }
  const npxPaths = [
    import_path.default.join(process.env.HOME || process.env.USERPROFILE || "", ".npm", "_npx", "templates"),
    import_path.default.join(process.cwd(), "node_modules", "create-mantle-devkit-app", "templates")
  ];
  for (const templatePath of npxPaths) {
    if (import_fs_extra.default.existsSync(templatePath)) {
      return templatePath;
    }
  }
  throw new Error(`Could not find templates directory. Searched from: ${__dirname}`);
}
function showBanner() {
  return new Promise((resolve) => {
    import_figlet.default.text("Mantle DevKit", {
      font: "ANSI Shadow",
      horizontalLayout: "default",
      verticalLayout: "default"
    }, (err, data) => {
      console.log();
      if (!err && data) {
        const lines = data.split("\n");
        const colors = [
          import_chalk.default.hex("#00D4FF"),
          import_chalk.default.hex("#00BFFF"),
          import_chalk.default.hex("#00A5FF"),
          import_chalk.default.hex("#008BFF"),
          import_chalk.default.hex("#0070FF"),
          import_chalk.default.hex("#0055FF"),
          import_chalk.default.hex("#003AFF")
        ];
        lines.forEach((line, i) => {
          const color = colors[Math.min(i, colors.length - 1)];
          console.log(color(line));
        });
      } else {
        console.log(import_chalk.default.bold.cyan("  Mantle DevKit"));
      }
      console.log();
      console.log(import_chalk.default.gray("  \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E"));
      console.log(import_chalk.default.gray("  \u2502"), import_chalk.default.cyan(" x402 Pay-per-Request APIs "), import_chalk.default.gray("\u2502"), import_chalk.default.green(" Agent Kit DeFi   "), import_chalk.default.gray("\u2502"));
      console.log(import_chalk.default.gray("  \u2502"), import_chalk.default.white("           Powered by Mantle Network                "), import_chalk.default.gray("\u2502"));
      console.log(import_chalk.default.gray("  \u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F"));
      console.log();
      console.log(import_chalk.default.gray(`  v${packageJson.version}`));
      console.log();
      resolve();
    });
  });
}
async function main() {
  await showBanner();
  import_commander.program.name("create-mantle-devkit-app").description("Create a new Mantle DevKit project - x402 APIs or Agent Kit DeFi apps").version(packageJson.version).argument("[project-name]", "Name of your project").option("--x402", "Create an x402 pay-per-request project").option("--agent-kit", "Create an Agent Kit DeFi swap project").option("--fullstack", "Create a fullstack project (x402)").option("--backend", "Create a backend-only project (x402)").option("--hono", "Use Hono framework (x402)").option("--express", "Use Express framework (x402)").option("--npm", "Use npm as package manager").option("--yarn", "Use yarn as package manager").option("--pnpm", "Use pnpm as package manager").option("--bun", "Use bun as package manager").option("--skip-install", "Skip installing dependencies").parse();
  const args = import_commander.program.args;
  const options = import_commander.program.opts();
  let projectName = args[0];
  let projectType;
  let framework;
  let packageManager = "npm";
  let installDeps = !options.skipInstall;
  if (options.agentKit) projectType = "agent-kit";
  if (options.x402 && options.fullstack) projectType = "x402-fullstack";
  if (options.x402 && options.backend) projectType = "x402-backend";
  if (options.fullstack && !options.agentKit) projectType = "x402-fullstack";
  if (options.backend && !options.agentKit) projectType = "x402-backend";
  if (options.hono) framework = "hono";
  if (options.express) framework = "express";
  let packageManagerFromFlag = false;
  if (options.npm) {
    packageManager = "npm";
    packageManagerFromFlag = true;
  } else if (options.yarn) {
    packageManager = "yarn";
    packageManagerFromFlag = true;
  } else if (options.pnpm) {
    packageManager = "pnpm";
    packageManagerFromFlag = true;
  } else if (options.bun) {
    packageManager = "bun";
    packageManagerFromFlag = true;
  }
  if (!projectName) {
    const { name } = await (0, import_prompts.default)({
      type: "text",
      name: "name",
      message: "What is your project name?",
      initial: "my-mantle-app",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return "Project name can only contain letters, numbers, hyphens, and underscores";
        }
        return true;
      }
    }, {
      onCancel: () => {
        console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
        process.exit(1);
      }
    });
    projectName = name;
  }
  if (!projectType) {
    const { sdk } = await (0, import_prompts.default)({
      type: "select",
      name: "sdk",
      message: "Which SDK do you want to use?",
      choices: [
        {
          title: import_chalk.default.cyan("x402"),
          value: "x402",
          description: "HTTP 402 pay-per-request APIs"
        },
        {
          title: import_chalk.default.green("Agent Kit"),
          value: "agent-kit",
          description: "DeFi swap demo with Agni, Merchant Moe, OpenOcean"
        }
      ],
      initial: 0
    }, {
      onCancel: () => {
        console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
        process.exit(1);
      }
    });
    if (sdk === "agent-kit") {
      projectType = "agent-kit";
    } else {
      const { x402Type } = await (0, import_prompts.default)({
        type: "select",
        name: "x402Type",
        message: "What type of x402 project?",
        choices: [
          {
            title: "Fullstack",
            value: "x402-fullstack",
            description: "Next.js frontend + API routes"
          },
          {
            title: "Backend only",
            value: "x402-backend",
            description: "Standalone API server"
          }
        ],
        initial: 0
      }, {
        onCancel: () => {
          console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
          process.exit(1);
        }
      });
      projectType = x402Type;
    }
  }
  if (projectType !== "agent-kit" && !framework) {
    const { fw } = await (0, import_prompts.default)({
      type: "select",
      name: "fw",
      message: "Which framework?",
      choices: [
        {
          title: "Hono",
          value: "hono",
          description: "Fast, lightweight, Web Standards"
        },
        {
          title: "Express",
          value: "express",
          description: "Popular, mature, extensive ecosystem"
        }
      ],
      initial: 0
    }, {
      onCancel: () => {
        console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
        process.exit(1);
      }
    });
    framework = fw;
  }
  if (!packageManagerFromFlag) {
    const response = await (0, import_prompts.default)([
      {
        type: "select",
        name: "packageManager",
        message: "Package manager:",
        choices: [
          { title: "npm", value: "npm" },
          { title: "yarn", value: "yarn" },
          { title: "pnpm", value: "pnpm" },
          { title: "bun", value: "bun" }
        ],
        initial: 0
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies?",
        initial: true
      }
    ], {
      onCancel: () => {
        console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
        process.exit(1);
      }
    });
    packageManager = response.packageManager;
    installDeps = response.installDeps;
  }
  if (!projectName || !projectType) {
    console.log(import_chalk.default.red("\n\u2716 Missing required options."));
    process.exit(1);
  }
  if (projectType !== "agent-kit" && !framework) {
    console.log(import_chalk.default.red("\n\u2716 Framework is required for x402 projects."));
    process.exit(1);
  }
  const projectPath = import_path.default.resolve(process.cwd(), projectName);
  const templateName = getTemplateDir(projectType, framework);
  console.log();
  console.log(import_chalk.default.bold("  Project Configuration"));
  console.log(import_chalk.default.gray("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log(import_chalk.default.gray("  Name:     "), import_chalk.default.cyan(projectName));
  console.log(import_chalk.default.gray("  Type:     "), projectType === "agent-kit" ? import_chalk.default.green("Agent Kit") : import_chalk.default.cyan(projectType));
  if (framework) {
    console.log(import_chalk.default.gray("  Framework:"), import_chalk.default.white(framework));
  }
  console.log(import_chalk.default.gray("  Package:  "), import_chalk.default.white(packageManager));
  console.log();
  if (import_fs_extra.default.existsSync(projectPath)) {
    const { overwrite } = await (0, import_prompts.default)({
      type: "confirm",
      name: "overwrite",
      message: `Directory ${import_chalk.default.cyan(projectName)} already exists. Overwrite?`,
      initial: false
    });
    if (!overwrite) {
      console.log(import_chalk.default.red("\n\u2716 Project creation cancelled."));
      process.exit(1);
    }
    import_fs_extra.default.removeSync(projectPath);
  }
  const spinner = (0, import_ora.default)("Creating project...").start();
  try {
    const templatesDir = getTemplatesDirectory();
    const templatePath = import_path.default.join(templatesDir, templateName);
    if (!import_fs_extra.default.existsSync(templatePath)) {
      spinner.fail(`Template not found: ${templateName}`);
      console.log(import_chalk.default.yellow(`
Available templates:`));
      if (import_fs_extra.default.existsSync(templatesDir)) {
        const templates = import_fs_extra.default.readdirSync(templatesDir);
        templates.forEach((t) => console.log(import_chalk.default.gray(`  \u2022 ${t}`)));
      } else {
        console.log(import_chalk.default.red(`Templates directory not found at: ${templatesDir}`));
      }
      process.exit(1);
    }
    import_fs_extra.default.copySync(templatePath, projectPath);
    const pkgPath = import_path.default.join(projectPath, "package.json");
    if (import_fs_extra.default.existsSync(pkgPath)) {
      const pkg = import_fs_extra.default.readJsonSync(pkgPath);
      pkg.name = projectName;
      import_fs_extra.default.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    }
    const gitignoreVariants = ["_gitignore", "gitignore"];
    for (const variant of gitignoreVariants) {
      const gitignorePath = import_path.default.join(projectPath, variant);
      if (import_fs_extra.default.existsSync(gitignorePath)) {
        import_fs_extra.default.renameSync(gitignorePath, import_path.default.join(projectPath, ".gitignore"));
        break;
      }
    }
    const envExampleVariants = ["_env.example", "env.example"];
    for (const variant of envExampleVariants) {
      const envExamplePath = import_path.default.join(projectPath, variant);
      if (import_fs_extra.default.existsSync(envExamplePath)) {
        import_fs_extra.default.renameSync(envExamplePath, import_path.default.join(projectPath, ".env.example"));
        break;
      }
    }
    spinner.succeed("Project created!");
    if (installDeps) {
      const installSpinner = (0, import_ora.default)("Installing dependencies...").start();
      try {
        const installCmd = {
          npm: "npm install",
          yarn: "yarn",
          pnpm: "pnpm install",
          bun: "bun install"
        }[packageManager];
        (0, import_child_process.execSync)(installCmd, {
          cwd: projectPath,
          stdio: "pipe"
        });
        installSpinner.succeed("Dependencies installed!");
      } catch (error) {
        installSpinner.fail("Failed to install dependencies");
        console.log(import_chalk.default.yellow("\nYou can install them manually:"));
        console.log(import_chalk.default.cyan(`  cd ${projectName}`));
        console.log(import_chalk.default.cyan(`  ${packageManager} install`));
      }
    }
    const runCmd = packageManager === "npm" ? "npm run" : packageManager;
    console.log();
    console.log(import_chalk.default.green.bold("\u2714 Success!"), `Created ${import_chalk.default.cyan(projectName)}`);
    console.log();
    console.log(import_chalk.default.bold("  Next steps:"));
    console.log();
    console.log(import_chalk.default.gray("  1."), import_chalk.default.cyan(`cd ${projectName}`));
    if (projectType === "agent-kit") {
      if (!installDeps) {
        console.log(import_chalk.default.gray("  2."), import_chalk.default.cyan(`${packageManager} install`));
        console.log(import_chalk.default.gray("  3."), import_chalk.default.cyan("cp .env.example .env"));
        console.log(import_chalk.default.gray("  4."), "Add your", import_chalk.default.yellow("PRIVATE_KEY"), "to .env");
        console.log(import_chalk.default.gray("  5."), import_chalk.default.cyan(`${runCmd} dev`));
      } else {
        console.log(import_chalk.default.gray("  2."), import_chalk.default.cyan("cp .env.example .env"));
        console.log(import_chalk.default.gray("  3."), "Add your", import_chalk.default.yellow("PRIVATE_KEY"), "to .env");
        console.log(import_chalk.default.gray("  4."), import_chalk.default.cyan(`${runCmd} dev`));
      }
      console.log();
      console.log(import_chalk.default.bold("  Available protocols:"));
      console.log(import_chalk.default.gray("  \u2022"), "Agni Finance - Primary DEX on Mantle");
      console.log(import_chalk.default.gray("  \u2022"), "Merchant Moe - Alternative DEX");
      console.log(import_chalk.default.gray("  \u2022"), "OpenOcean - DEX Aggregator (mainnet only)");
    } else {
      if (!installDeps) {
        console.log(import_chalk.default.gray("  2."), import_chalk.default.cyan(`${packageManager} install`));
        console.log(import_chalk.default.gray("  3."), import_chalk.default.cyan("cp .env.example .env"));
        console.log(import_chalk.default.gray("  4."), "Get your App ID from", import_chalk.default.underline("https://mantle-devkit.vercel.app"));
        console.log(import_chalk.default.gray("  5."), import_chalk.default.cyan(`${runCmd} dev`));
      } else {
        console.log(import_chalk.default.gray("  2."), import_chalk.default.cyan("cp .env.example .env"));
        console.log(import_chalk.default.gray("  3."), "Get your App ID from", import_chalk.default.underline("https://mantle-devkit.vercel.app"));
        console.log(import_chalk.default.gray("  4."), import_chalk.default.cyan(`${runCmd} dev`));
      }
    }
    console.log();
    console.log(import_chalk.default.gray("  Documentation:"), import_chalk.default.underline("https://mantle-devkit.vercel.app"));
    console.log();
  } catch (error) {
    spinner.fail("Failed to create project");
    console.error(error);
    process.exit(1);
  }
}
main().catch(console.error);
