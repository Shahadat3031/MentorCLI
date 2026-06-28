import chalk from "chalk";
import ora from "ora";
export async function diffCommand() {
    const spinner = ora(chalk.cyan("Fetching diff...")).start();
    spinner.succeed(chalk.green("Diff feature will be implemented in next feature"));
}
//# sourceMappingURL=diff.js.map