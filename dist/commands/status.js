import chalk from "chalk";
import ora from "ora";
export async function statusCommand() {
    const spinner = ora(chalk.cyan("Checking status...")).start();
    spinner.succeed(chalk.green("Status feature will be implemented in next feature"));
}
//# sourceMappingURL=status.js.map