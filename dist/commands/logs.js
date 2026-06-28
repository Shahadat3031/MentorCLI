import chalk from "chalk";
import ora from "ora";
export async function logsCommand() {
    const spinner = ora(chalk.cyan("Fetching logs...")).start();
    spinner.succeed(chalk.green("Logs feature will be implemented in next feature"));
}
//# sourceMappingURL=logs.js.map