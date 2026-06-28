import chalk from "chalk"
import inquirer from "inquirer"
import { resumeBuild, listSessions, loadSessionState } from "../workflow/index.js"

export async function resumeCommand(): Promise<void> {
  const sessions = await listSessions()
  const pausedSessions = []

  for (const buildId of sessions) {
    const state = await loadSessionState(buildId)
    if (state?.status === "paused") {
      pausedSessions.push({ name: `${buildId} (${state.currentNode})`, value: buildId })
    }
  }

  if (pausedSessions.length === 0) {
    console.log(chalk.yellow("No paused builds found"))
    return
  }

  const { buildId } = await inquirer.prompt([
    {
      type: "list",
      name: "buildId",
      message: "Select build to resume:",
      choices: pausedSessions,
    },
  ])

  console.log(chalk.cyan(`\nResuming build ${buildId}...\n`))
  await resumeBuild(buildId)
}
