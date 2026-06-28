import chalk from "chalk"
import { ensureMentorDir, loadGlobalConfig } from "../config/index.js"

export async function initCommand(): Promise<void> {
  await ensureMentorDir()
  await loadGlobalConfig()
  console.log(chalk.green("✓ Initialized ~/.mentor directory"))
}
