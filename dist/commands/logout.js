import chalk from "chalk";
import inquirer from "inquirer";
import { authManager } from "../auth/index.js";
export async function logoutCommand() {
    const { provider } = await inquirer.prompt([
        {
            type: "list",
            name: "provider",
            message: "Which provider to logout?",
            choices: [
                { name: "OpenAI", value: "openai" },
                { name: "Anthropic (Claude)", value: "anthropic" },
                { name: "Both", value: "both" },
            ],
        },
    ]);
    if (provider === "openai" || provider === "both") {
        await authManager.removeKey("openai");
        console.log(chalk.green("✓ OpenAI credentials removed"));
    }
    if (provider === "anthropic" || provider === "both") {
        await authManager.removeKey("anthropic");
        console.log(chalk.green("✓ Anthropic credentials removed"));
    }
}
//# sourceMappingURL=logout.js.map