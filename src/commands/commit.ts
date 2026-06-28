import chalk from "chalk"
import inquirer from "inquirer"
import { GitEngine } from "../git/index.js"

export async function commitCommand(): Promise<void> {
  const git = new GitEngine()
  const isRepo = await git.isRepo()

  if (!isRepo) {
    console.log(chalk.yellow("Not a git repository"))
    return
  }

  const hasChanges = await git.hasChanges()
  if (!hasChanges) {
    console.log(chalk.yellow("No changes to commit"))
    return
  }

  console.log(chalk.cyan("\nChanges:\n"))
  console.log(git.diff())

  const { message } = await inquirer.prompt([
    {
      type: "input",
      name: "message",
      message: "Commit message:",
      default: "chore: update",
    },
  ])

  try {
    git.commit(message)
    console.log(chalk.green(`✓ Committed: ${message}`))
  } catch (e) {
    console.log(chalk.red(`Commit failed: ${e instanceof Error ? e.message : String(e)}`))
  }
}
