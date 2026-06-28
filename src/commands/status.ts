import chalk from "chalk"
import { listSessions, loadSession } from "../sessions/index.js"

export async function statusCommand(): Promise<void> {
  const sessions = await listSessions()

  if (sessions.length === 0) {
    console.log(chalk.yellow("No sessions found"))
    return
  }

  console.log(chalk.cyan("\nSessions:\n"))

  for (const id of sessions) {
    const session = await loadSession(id)
    if (!session) {
      console.log(`  ${id}: ${chalk.red("corrupted")}`)
      continue
    }

    const color =
      session.status === "completed" ? chalk.green :
      session.status === "failed" ? chalk.red :
      session.status === "paused" ? chalk.yellow :
      chalk.blue

    const tasks = `${session.completedTasks.length}/${session.tasks.length} tasks`
    const current = session.currentTask < session.tasks.length
      ? ` | current: ${session.tasks[session.currentTask].name}`
      : ""

    console.log(`  ${id}: ${color(session.status)} (${tasks})${current}`)
  }

  console.log("")
}
