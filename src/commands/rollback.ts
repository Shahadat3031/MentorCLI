import chalk from "chalk"
import inquirer from "inquirer"
import { gitManager } from "../git/index.js"

export async function rollbackCommand(): Promise<void> {
  try {
    const isRepo = await gitManager.isRepo()
    if (!isRepo) {
      console.log(chalk.yellow("Not a git repository"))
      return
    }

    const diff = await gitManager.diff()
    if (!diff) {
      console.log(chalk.yellow("No uncommitted changes to rollback"))
      return
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Rollback all uncommitted changes?",
        default: false,
      },
    ])

    if (!confirm) {
      console.log(chalk.yellow("Rollback cancelled"))
      return
    }

    await gitManager.rollback()
    console.log(chalk.green("✓ Rolled back uncommitted changes"))
  } catch (e) {
    console.log(chalk.red(`Error: ${e instanceof Error ? e.message : String(e)}`))
  }
}
