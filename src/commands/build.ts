import chalk from "chalk"
import ora from "ora"

export async function buildCommand(prdFile: string): Promise<void> {
  const spinner = ora(chalk.blue("Starting build...")).start()
  spinner.succeed(chalk.green("Build workflow will be implemented in next feature"))
  console.log(chalk.yellow(`PRD file: ${prdFile}`))
}
