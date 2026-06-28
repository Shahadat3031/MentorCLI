import chalk from "chalk"
import inquirer from "inquirer"
import { gitManager } from "../git/index.js"

export async function commitCommand(): Promise<void> {
  try {
    const isRepo = await gitManager.isRepo()
    if (!isRepo) {
      console.log(chalk.yellow("Not a git repository"))
      return
    }

    const diff = await gitManager.diff()
    if (!diff) {
      console.log(chalk.yellow("No changes to commit"))
      return
    }

    const { message } = await inquirer.prompt([
      {
        type: "input",
        name: "message",
        message: "Commit message:",
        default: "chore: update changes",
      },
    ])

    const hash = await gitManager.commit(message)
    console.log(chalk.green(`✓ Committed: ${hash}`))
  } catch (e) {
    console.log(chalk.red(`Error: ${e instanceof Error ? e.message : String(e)}`))
  }
}
