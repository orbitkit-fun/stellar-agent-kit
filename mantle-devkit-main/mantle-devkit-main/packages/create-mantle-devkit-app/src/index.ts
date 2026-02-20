#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import figlet from 'figlet'

const packageJson = require('../package.json')

type ProjectType = 'x402-fullstack' | 'x402-backend' | 'agent-kit'
type Framework = 'hono' | 'express'
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

interface ProjectOptions {
  name: string
  projectType: ProjectType
  framework?: Framework
  packageManager: PackageManager
  installDeps: boolean
}

function getTemplateDir(projectType: ProjectType, framework?: Framework): string {
  if (projectType === 'agent-kit') {
    return 'agent-kit'
  }
  const type = projectType === 'x402-fullstack' ? 'fullstack' : 'backend'
  return `${type}-${framework}`
}

function getTemplatesDirectory(): string {
  const possiblePaths = [
    path.join(__dirname, '..', 'templates'),
    path.join(__dirname, 'templates'),
  ]

  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath
    }
  }

  let currentDir = __dirname
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const pkgPath = path.join(currentDir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = fs.readJsonSync(pkgPath)
        if (pkg.name === 'create-mantle-devkit-app') {
          const templatesPath = path.join(currentDir, 'templates')
          if (fs.existsSync(templatesPath)) {
            return templatesPath
          }
        }
      } catch (e) {
        // Continue searching
      }
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      break
    }
    currentDir = parentDir
    attempts++
  }

  const npxPaths = [
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.npm', '_npx', 'templates'),
    path.join(process.cwd(), 'node_modules', 'create-mantle-devkit-app', 'templates'),
  ]

  for (const templatePath of npxPaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath
    }
  }

  throw new Error(`Could not find templates directory. Searched from: ${__dirname}`)
}

function showBanner(): Promise<void> {
  return new Promise((resolve) => {
    figlet.text('Mantle DevKit', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }, (err, data) => {
      console.log()
      if (!err && data) {
        const lines = data.split('\n')
        const colors = [
          chalk.hex('#00D4FF'),
          chalk.hex('#00BFFF'),
          chalk.hex('#00A5FF'),
          chalk.hex('#008BFF'),
          chalk.hex('#0070FF'),
          chalk.hex('#0055FF'),
          chalk.hex('#003AFF')
        ]
        lines.forEach((line, i) => {
          const color = colors[Math.min(i, colors.length - 1)]
          console.log(color(line))
        })
      } else {
        console.log(chalk.bold.cyan('  Mantle DevKit'))
      }
      console.log()
      console.log(chalk.gray('  ╭─────────────────────────────────────────────────────╮'))
      console.log(chalk.gray('  │'), chalk.cyan(' x402 Pay-per-Request APIs '), chalk.gray('│'), chalk.green(' Agent Kit DeFi   '), chalk.gray('│'))
      console.log(chalk.gray('  │'), chalk.white('           Powered by Mantle Network                '), chalk.gray('│'))
      console.log(chalk.gray('  ╰─────────────────────────────────────────────────────╯'))
      console.log()
      console.log(chalk.gray(`  v${packageJson.version}`))
      console.log()
      resolve()
    })
  })
}

async function main() {
  await showBanner()

  program
    .name('create-mantle-devkit-app')
    .description('Create a new Mantle DevKit project - x402 APIs or Agent Kit DeFi apps')
    .version(packageJson.version)
    .argument('[project-name]', 'Name of your project')
    .option('--x402', 'Create an x402 pay-per-request project')
    .option('--agent-kit', 'Create an Agent Kit DeFi swap project')
    .option('--fullstack', 'Create a fullstack project (x402)')
    .option('--backend', 'Create a backend-only project (x402)')
    .option('--hono', 'Use Hono framework (x402)')
    .option('--express', 'Use Express framework (x402)')
    .option('--npm', 'Use npm as package manager')
    .option('--yarn', 'Use yarn as package manager')
    .option('--pnpm', 'Use pnpm as package manager')
    .option('--bun', 'Use bun as package manager')
    .option('--skip-install', 'Skip installing dependencies')
    .parse()

  const args = program.args
  const options = program.opts()

  let projectName = args[0]
  let projectType: ProjectType | undefined
  let framework: Framework | undefined
  let packageManager: PackageManager = 'npm'
  let installDeps = !options.skipInstall

  // Determine options from flags
  if (options.agentKit) projectType = 'agent-kit'
  if (options.x402 && options.fullstack) projectType = 'x402-fullstack'
  if (options.x402 && options.backend) projectType = 'x402-backend'
  if (options.fullstack && !options.agentKit) projectType = 'x402-fullstack'
  if (options.backend && !options.agentKit) projectType = 'x402-backend'
  if (options.hono) framework = 'hono'
  if (options.express) framework = 'express'

  let packageManagerFromFlag = false
  if (options.npm) { packageManager = 'npm'; packageManagerFromFlag = true }
  else if (options.yarn) { packageManager = 'yarn'; packageManagerFromFlag = true }
  else if (options.pnpm) { packageManager = 'pnpm'; packageManagerFromFlag = true }
  else if (options.bun) { packageManager = 'bun'; packageManagerFromFlag = true }

  // Step 1: Ask for project name first
  if (!projectName) {
    const { name } = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is your project name?',
      initial: 'my-mantle-app',
      validate: (value: string) => {
        if (!value) return 'Project name is required'
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores'
        }
        return true
      },
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    projectName = name
  }

  // Step 2: Ask for SDK type (x402 or agent-kit)
  if (!projectType) {
    const { sdk } = await prompts({
      type: 'select',
      name: 'sdk',
      message: 'Which SDK do you want to use?',
      choices: [
        {
          title: chalk.cyan('x402'),
          value: 'x402',
          description: 'HTTP 402 pay-per-request APIs'
        },
        {
          title: chalk.green('Agent Kit'),
          value: 'agent-kit',
          description: 'DeFi swap demo with Agni, Merchant Moe, OpenOcean'
        },
      ],
      initial: 0,
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })

    if (sdk === 'agent-kit') {
      projectType = 'agent-kit'
    } else {
      // Step 2b: Ask for x402 project type (fullstack or backend)
      const { x402Type } = await prompts({
        type: 'select',
        name: 'x402Type',
        message: 'What type of x402 project?',
        choices: [
          {
            title: 'Fullstack',
            value: 'x402-fullstack',
            description: 'Next.js frontend + API routes'
          },
          {
            title: 'Backend only',
            value: 'x402-backend',
            description: 'Standalone API server'
          },
        ],
        initial: 0,
      }, {
        onCancel: () => {
          console.log(chalk.red('\n✖ Project creation cancelled.'))
          process.exit(1)
        },
      })
      projectType = x402Type
    }
  }

  // Step 3: Ask for framework (only for x402 projects)
  if (projectType !== 'agent-kit' && !framework) {
    const { fw } = await prompts({
      type: 'select',
      name: 'fw',
      message: 'Which framework?',
      choices: [
        {
          title: 'Hono',
          value: 'hono',
          description: 'Fast, lightweight, Web Standards'
        },
        {
          title: 'Express',
          value: 'express',
          description: 'Popular, mature, extensive ecosystem'
        },
      ],
      initial: 0,
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    framework = fw
  }

  // Step 4: Ask for package manager and install preference
  if (!packageManagerFromFlag) {
    const response = await prompts([
      {
        type: 'select',
        name: 'packageManager',
        message: 'Package manager:',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
          { title: 'bun', value: 'bun' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies?',
        initial: true,
      }
    ], {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    packageManager = response.packageManager
    installDeps = response.installDeps
  }

  if (!projectName || !projectType) {
    console.log(chalk.red('\n✖ Missing required options.'))
    process.exit(1)
  }

  if (projectType !== 'agent-kit' && !framework) {
    console.log(chalk.red('\n✖ Framework is required for x402 projects.'))
    process.exit(1)
  }

  const projectPath = path.resolve(process.cwd(), projectName)
  const templateName = getTemplateDir(projectType, framework)

  // Show selection summary
  console.log()
  console.log(chalk.bold('  Project Configuration'))
  console.log(chalk.gray('  ─────────────────────'))
  console.log(chalk.gray('  Name:     '), chalk.cyan(projectName))
  console.log(chalk.gray('  Type:     '), projectType === 'agent-kit' ? chalk.green('Agent Kit') : chalk.cyan(projectType))
  if (framework) {
    console.log(chalk.gray('  Framework:'), chalk.white(framework))
  }
  console.log(chalk.gray('  Package:  '), chalk.white(packageManager))
  console.log()

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${chalk.cyan(projectName)} already exists. Overwrite?`,
      initial: false,
    })

    if (!overwrite) {
      console.log(chalk.red('\n✖ Project creation cancelled.'))
      process.exit(1)
    }

    fs.removeSync(projectPath)
  }

  // Create project
  const spinner = ora('Creating project...').start()

  try {
    const templatesDir = getTemplatesDirectory()
    const templatePath = path.join(templatesDir, templateName)

    if (!fs.existsSync(templatePath)) {
      spinner.fail(`Template not found: ${templateName}`)
      console.log(chalk.yellow(`\nAvailable templates:`))
      if (fs.existsSync(templatesDir)) {
        const templates = fs.readdirSync(templatesDir)
        templates.forEach(t => console.log(chalk.gray(`  • ${t}`)))
      } else {
        console.log(chalk.red(`Templates directory not found at: ${templatesDir}`))
      }
      process.exit(1)
    }

    fs.copySync(templatePath, projectPath)

    // Update package.json with project name
    const pkgPath = path.join(projectPath, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = fs.readJsonSync(pkgPath)
      pkg.name = projectName
      fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
    }

    // Rename gitignore (npm ignores .gitignore in packages)
    const gitignoreVariants = ['_gitignore', 'gitignore']
    for (const variant of gitignoreVariants) {
      const gitignorePath = path.join(projectPath, variant)
      if (fs.existsSync(gitignorePath)) {
        fs.renameSync(gitignorePath, path.join(projectPath, '.gitignore'))
        break
      }
    }

    // Rename env.example to .env.example
    const envExampleVariants = ['_env.example', 'env.example']
    for (const variant of envExampleVariants) {
      const envExamplePath = path.join(projectPath, variant)
      if (fs.existsSync(envExamplePath)) {
        fs.renameSync(envExamplePath, path.join(projectPath, '.env.example'))
        break
      }
    }

    spinner.succeed('Project created!')

    // Install dependencies
    if (installDeps) {
      const installSpinner = ora('Installing dependencies...').start()

      try {
        const installCmd = {
          npm: 'npm install',
          yarn: 'yarn',
          pnpm: 'pnpm install',
          bun: 'bun install',
        }[packageManager]

        execSync(installCmd, {
          cwd: projectPath,
          stdio: 'pipe',
        })

        installSpinner.succeed('Dependencies installed!')
      } catch (error) {
        installSpinner.fail('Failed to install dependencies')
        console.log(chalk.yellow('\nYou can install them manually:'))
        console.log(chalk.cyan(`  cd ${projectName}`))
        console.log(chalk.cyan(`  ${packageManager} install`))
      }
    }

    // Success message
    const runCmd = packageManager === 'npm' ? 'npm run' : packageManager

    console.log()
    console.log(chalk.green.bold('✔ Success!'), `Created ${chalk.cyan(projectName)}`)
    console.log()
    console.log(chalk.bold('  Next steps:'))
    console.log()
    console.log(chalk.gray('  1.'), chalk.cyan(`cd ${projectName}`))

    if (projectType === 'agent-kit') {
      // Agent Kit specific instructions
      if (!installDeps) {
        console.log(chalk.gray('  2.'), chalk.cyan(`${packageManager} install`))
        console.log(chalk.gray('  3.'), chalk.cyan('cp .env.example .env'))
        console.log(chalk.gray('  4.'), 'Add your', chalk.yellow('PRIVATE_KEY'), 'to .env')
        console.log(chalk.gray('  5.'), chalk.cyan(`${runCmd} dev`))
      } else {
        console.log(chalk.gray('  2.'), chalk.cyan('cp .env.example .env'))
        console.log(chalk.gray('  3.'), 'Add your', chalk.yellow('PRIVATE_KEY'), 'to .env')
        console.log(chalk.gray('  4.'), chalk.cyan(`${runCmd} dev`))
      }
      console.log()
      console.log(chalk.bold('  Available protocols:'))
      console.log(chalk.gray('  •'), 'Agni Finance - Primary DEX on Mantle')
      console.log(chalk.gray('  •'), 'Merchant Moe - Alternative DEX')
      console.log(chalk.gray('  •'), 'OpenOcean - DEX Aggregator (mainnet only)')
    } else {
      // x402 specific instructions
      if (!installDeps) {
        console.log(chalk.gray('  2.'), chalk.cyan(`${packageManager} install`))
        console.log(chalk.gray('  3.'), chalk.cyan('cp .env.example .env'))
        console.log(chalk.gray('  4.'), 'Get your App ID from', chalk.underline('https://mantle-devkit.vercel.app'))
        console.log(chalk.gray('  5.'), chalk.cyan(`${runCmd} dev`))
      } else {
        console.log(chalk.gray('  2.'), chalk.cyan('cp .env.example .env'))
        console.log(chalk.gray('  3.'), 'Get your App ID from', chalk.underline('https://mantle-devkit.vercel.app'))
        console.log(chalk.gray('  4.'), chalk.cyan(`${runCmd} dev`))
      }
    }

    console.log()
    console.log(chalk.gray('  Documentation:'), chalk.underline('https://mantle-devkit.vercel.app'))
    console.log()
  } catch (error) {
    spinner.fail('Failed to create project')
    console.error(error)
    process.exit(1)
  }
}

main().catch(console.error)
