import chalk from "chalk"
import inquirer from "inquirer"
import { listSessions } from "../workflow/index.js"
import { logger } from "../logs/index.js"

export async function logsCommand(): Promise<void> {
  const sessions = await listSessions()

  if (sessions.length === 0) {
    console.log(chalk.yellow("No builds found"))
    return
  }

  const { buildId } = await inquirer.prompt([
    {
      type: "list",
      name: "buildId",
      message: "Select build to view logs:",
      choices: sessions,
    },
  ])

  const { channel } = await inquirer.prompt([
    {
      type: "list",
      name: "channel",
      message: "Select log channel:",
      choices: [
        { name: "Planner", value: "planner" },
        { name: "Executor", value: "executor" },
        { name: "Reviewer", value: "reviewer" },
        { name: "Tester", value: "tester" },
        { name: "Git", value: "git" },
        { name: "Human", value: "human" },
        { name: "All", value: "all" },
      ],
    },
  ])

  const logs = await logger.getLogs(buildId)

  if (channel === "all") {
    for (const [ch, content] of Object.entries(logs)) {
      if (content) {
        const color =
          ch === "planner" ? chalk.blue :
          ch === "executor" ? chalk.green :
          ch === "tester" ? chalk.yellow :
          ch === "reviewer" ? chalk.magenta :
          ch === "git" ? chalk.cyan :
          chalk.red
        console.log(color(`\n=== ${ch.toUpperCase()} ===\n`))
        console.log(content)
      }
    }
  } else {
    const content = logs[channel]
    if (!content) {
      console.log(chalk.yellow(`No logs for ${channel}`))
      return
    }
    console.log(content)
  }
}
