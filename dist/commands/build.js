import chalk from "chalk";
import ora from "ora";
export async function buildCommand(prdFile) {
    const spinner = ora(chalk.blue("Starting build...")).start();
    spinner.succeed(chalk.green("Build workflow will be implemented in next feature"));
    console.log(chalk.yellow(`PRD file: ${prdFile}`));
}
//# sourceMappingURL=build.js.map