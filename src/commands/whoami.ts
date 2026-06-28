import chalk from "chalk"
import { authManager } from "../auth/index.js"

export async function whoamiCommand(): Promise<void> {
  const config = await authManager.loadConfig()
  const openaiStatus = config.openai?.apiKey ? "connected" : "disconnected"
  const anthropicStatus = config.anthropic?.apiKey ? "connected" : "disconnected"

  console.log(`${chalk.blue("OpenAI:")}  ${openaiStatus === "connected" ? chalk.green(openaiStatus) : chalk.red(openaiStatus)}`)
  console.log(`${chalk.green("Claude:")}  ${anthropicStatus === "connected" ? chalk.green(anthropicStatus) : chalk.red(anthropicStatus)}`)
}
