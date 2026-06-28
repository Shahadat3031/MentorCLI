import chalk from "chalk"
import { GitEngine } from "../git/index.js"

export async function diffCommand(): Promise<void> {
  const git = new GitEngine()
  const isRepo = await git.isRepo()

  if (!isRepo) {
    console.log(chalk.yellow("Not a git repository"))
    return
  }

  const diff = git.diff()
  if (!diff) {
    console.log(chalk.green("No uncommitted changes"))
    return
  }

  console.log(diff)
}
