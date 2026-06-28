import chalk from "chalk"
import { listSessions, loadSessionState } from "../workflow/index.js"

export async function statusCommand(): Promise<void> {
  const sessions = await listSessions()

  if (sessions.length === 0) {
    console.log(chalk.yellow("No builds found"))
    return
  }

  console.log(chalk.cyan("\nBuild Sessions:\n"))

  for (const buildId of sessions) {
    const state = await loadSessionState(buildId)
    if (!state) {
      console.log(`  ${buildId}: ${chalk.red("corrupted state")}`)
      continue
    }

    const statusColor =
      state.status === "completed" ? chalk.green :
      state.status === "failed" ? chalk.red :
      state.status === "paused" ? chalk.yellow :
      chalk.blue

    const moduleInfo = state.currentModule
      ? ` | Module: ${state.currentModule}`
      : ""

    const progress = state.completedModules.length > 0
      ? `\n    Completed: ${state.completedModules.join(", ")}`
      : ""

    console.log(`  ${buildId}: ${statusColor(state.status)}${moduleInfo}${progress}`)
  }

  console.log("")
}
