import chalk from "chalk"
import inquirer from "inquirer"
import { authManager } from "../auth/index.js"

export async function loginCommand(): Promise<void> {
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Choose provider:",
      choices: [
        { name: "OpenAI", value: "openai" },
        { name: "Anthropic (Claude)", value: "anthropic" },
        { name: "Both", value: "both" },
      ],
    },
  ])

  if (provider === "openai" || provider === "both") {
    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter OpenAI API key:",
        mask: "*",
      },
    ])
    const valid = await authManager.validateKey("openai", apiKey)
    if (!valid) {
      console.log(chalk.red("✗ Invalid OpenAI API key"))
      return
    }
    await authManager.saveKey("openai", apiKey)
    console.log(chalk.green("✓ OpenAI API key saved"))
  }

  if (provider === "anthropic" || provider === "both") {
    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter Anthropic API key:",
        mask: "*",
      },
    ])
    const valid = await authManager.validateKey("anthropic", apiKey)
    if (!valid) {
      console.log(chalk.red("✗ Invalid Anthropic API key"))
      return
    }
    await authManager.saveKey("anthropic", apiKey)
    console.log(chalk.green("✓ Anthropic API key saved"))
  }
}
