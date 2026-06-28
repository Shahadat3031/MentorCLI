import chalk from "chalk"
import ora from "ora"

export async function commitCommand(): Promise<void> {
  const spinner = ora(chalk.cyan("Committing changes...")).start()
  spinner.succeed(chalk.green("Commit feature will be implemented in next feature"))
}
