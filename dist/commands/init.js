import chalk from "chalk";
import { ensureMentorDir, getProjectRoot } from "../config/index.js";
export async function initCommand() {
    const projectRoot = getProjectRoot();
    await ensureMentorDir(projectRoot);
    console.log(chalk.green("✓ Initialized .mentor directory structure"));
}
//# sourceMappingURL=init.js.map