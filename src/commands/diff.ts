import chalk from "chalk"
import ora from "ora"

export async function diffCommand(): Promise<void> {
  const spinner = ora(chalk.cyan("Fetching diff...")).start()
  spinner.succeed(chalk.green("Diff feature will be implemented in next feature"))
}
