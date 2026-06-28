import chalk from "chalk"
import ora from "ora"

export async function logsCommand(): Promise<void> {
  const spinner = ora(chalk.cyan("Fetching logs...")).start()
  spinner.succeed(chalk.green("Logs feature will be implemented in next feature"))
}
