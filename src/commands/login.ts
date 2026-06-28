import chalk from "chalk"
import inquirer from "inquirer"
import fs from "fs/promises"
import path from "path"
import os from "os"

const ENV_FILE = path.join(os.homedir(), ".mentor", ".env")

export async function loginCommand(): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Set API key", value: "set" },
        { name: "View saved keys", value: "view" },
        { name: "Remove API key", value: "remove" },
      ],
    },
  ])

  if (action === "set") {
    await setKey()
  } else if (action === "view") {
    await viewKeys()
  } else {
    await removeKey()
  }
}

async function setKey(): Promise<void> {
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Select provider:",
      choices: [
        { name: "OpenAI", value: "OPENAI_API_KEY" },
        { name: "OpenRouter", value: "OPENROUTER_API_KEY" },
        { name: "Groq", value: "GROQ_API_KEY" },
        { name: "Gemini", value: "GEMINI_API_KEY" },
        { name: "OpenCode path (optional)", value: "OPENCODE_PATH" },
      ],
    },
  ])

  const { key } = await inquirer.prompt([
    {
      type: "password",
      name: "key",
      message: "Enter API key:",
      mask: "*",
    },
  ])

  await ensureEnvFile()
  await appendEnv(provider, key)
  console.log(chalk.green(`✓ Saved ${provider}`))
}

async function viewKeys(): Promise<void> {
  try {
    const content = await fs.readFile(ENV_FILE, "utf-8")
    const lines = content.split("\n").filter(Boolean)
    if (lines.length === 0) {
      console.log(chalk.yellow("No API keys saved"))
      return
    }
    console.log(chalk.cyan("\nSaved API keys:"))
    for (const line of lines) {
      const [name] = line.split("=")
      console.log(`  ${chalk.green("✓")} ${name}`)
    }
  } catch {
    console.log(chalk.yellow("No API keys saved"))
  }
}

async function removeKey(): Promise<void> {
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Select key to remove:",
      choices: [
        { name: "OpenAI", value: "OPENAI_API_KEY" },
        { name: "OpenRouter", value: "OPENROUTER_API_KEY" },
        { name: "Groq", value: "GROQ_API_KEY" },
        { name: "Gemini", value: "GEMINI_API_KEY" },
      ],
    },
  ])

  try {
    const content = await fs.readFile(ENV_FILE, "utf-8")
    const lines = content.split("\n").filter((l) => !l.startsWith(`${provider}=`))
    await fs.writeFile(ENV_FILE, lines.join("\n"), "utf-8")
    console.log(chalk.green(`✓ Removed ${provider}`))
  } catch {
    console.log(chalk.yellow("No keys to remove"))
  }
}

async function ensureEnvFile(): Promise<void> {
  await fs.mkdir(path.dirname(ENV_FILE), { recursive: true })
  try {
    await fs.access(ENV_FILE)
  } catch {
    await fs.writeFile(ENV_FILE, "", "utf-8")
  }
}

async function appendEnv(key: string, value: string): Promise<void> {
  const content = await fs.readFile(ENV_FILE, "utf-8")
  const lines = content.split("\n").filter((l) => !l.startsWith(`${key}=`))
  lines.push(`${key}=${value}`)
  await fs.writeFile(ENV_FILE, lines.join("\n") + "\n", "utf-8")
}
