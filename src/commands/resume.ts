import chalk from "chalk"
import ora from "ora"

export async function resumeCommand(): Promise<void> {
  const spinner = ora(chalk.blue("Resuming build...")).start()
  spinner.succeed(chalk.green("Resume feature will be implemented in next feature"))
}
