import chalk from "chalk"
import inquirer from "inquirer"
import { listSessions, loadSession } from "../sessions/index.js"
import { ProviderRegistry } from "../providers/registry.js"
import { Orchestrator } from "../orchestrator/index.js"

export async function resumeCommand(): Promise<void> {
  const sessions = await listSessions()
  const choices = []

  for (const id of sessions) {
    const session = await loadSession(id)
    if (session && session.status !== "completed") {
      choices.push({
        name: `${id} (${session.status}) - ${session.completedTasks.length}/${session.tasks.length} tasks`,
        value: id,
      })
    }
  }

  if (choices.length === 0) {
    console.log(chalk.yellow("No incomplete sessions found"))
    return
  }

  const { sessionId } = await inquirer.prompt([
    {
      type: "list",
      name: "sessionId",
      message: "Select session to resume:",
      choices,
    },
  ])

  const registry = new ProviderRegistry()
  await registry.init()

  const orchestrator = new Orchestrator(registry)
  await orchestrator.resume(sessionId)
}
