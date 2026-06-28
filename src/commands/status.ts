import chalk from "chalk"
import ora from "ora"

export async function statusCommand(): Promise<void> {
  const spinner = ora(chalk.cyan("Checking status...")).start()
  spinner.succeed(chalk.green("Status feature will be implemented in next feature"))
}
