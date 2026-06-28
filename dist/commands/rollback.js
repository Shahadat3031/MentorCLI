import chalk from "chalk";
import ora from "ora";
export async function rollbackCommand() {
    const spinner = ora(chalk.cyan("Rolling back...")).start();
    spinner.succeed(chalk.green("Rollback feature will be implemented in next feature"));
}
//# sourceMappingURL=rollback.js.map