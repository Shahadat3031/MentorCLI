import chalk from "chalk"
import inquirer from "inquirer"
import { GitEngine } from "../git/index.js"

export async function rollbackCommand(): Promise<void> {
  const git = new GitEngine()
  const isRepo = await git.isRepo()

  if (!isRepo) {
    console.log(chalk.yellow("Not a git repository"))
    return
  }

  const hasChanges = await git.hasChanges()
  if (!hasChanges) {
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

  try {
    git.rollback()
    console.log(chalk.green("✓ Rolled back uncommitted changes"))
  } catch (e) {
    console.log(chalk.red(`Rollback failed: ${e instanceof Error ? e.message : String(e)}`))
  }
}
