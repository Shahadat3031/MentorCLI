import chalk from "chalk"
import { gitManager } from "../git/index.js"

export async function diffCommand(): Promise<void> {
  try {
    const isRepo = await gitManager.isRepo()
    if (!isRepo) {
      console.log(chalk.yellow("Not a git repository"))
      return
    }
    const diffOutput = await gitManager.diff()
    if (!diffOutput) {
      console.log(chalk.green("No uncommitted changes"))
      return
    }
    console.log(diffOutput)
  } catch (e) {
    console.log(chalk.red(`Error: ${e instanceof Error ? e.message : String(e)}`))
  }
}
