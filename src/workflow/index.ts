import fs from "fs/promises"
import path from "path"
import chalk from "chalk"
import { buildWorkflowGraph } from "./graph.js"
import { createInitialState } from "./state.js"
import { detectProjectType } from "../project/index.js"
import { getSessionsDir, getProjectRoot, ensureMentorDir } from "../config/index.js"
import { BuildState, ProjectType } from "../types/index.js"
import { BuildStateSchema } from "../schemas/index.js"
import { logger } from "../logs/index.js"

export async function runBuild(prd: string, buildId: string): Promise<void> {
  const projectRoot = getProjectRoot()
  const projectType = await detectProjectType(projectRoot)
  await ensureMentorDir(projectRoot)

  logger.setBuildId(buildId)

  const initialState = createInitialState(buildId, prd, projectType)
  initialState.currentModule = initialState.pendingModules[0] || null

  const app = buildWorkflowGraph()
  const config = { configurable: { thread_id: buildId } }

  const finalState = await app.invoke(initialState, config)
  await saveSessionState(buildId, finalState as BuildState)
}

export async function resumeBuild(buildId: string): Promise<void> {
  const state = await loadSessionState(buildId)
  if (!state) {
    console.log(chalk.red(`No session found for build: ${buildId}`))
    return
  }

  if (state.status !== "paused") {
    console.log(chalk.yellow(`Build ${buildId} is not paused (status: ${state.status})`))
    return
  }

  logger.setBuildId(buildId)
  const app = buildWorkflowGraph()
  const config = { configurable: { thread_id: buildId } }

  console.log(chalk.blue(`Resuming build ${buildId} from node: ${state.currentNode}`))
  const finalState = await app.invoke(state, config)
  await saveSessionState(buildId, finalState as BuildState)
}

export async function saveSessionState(buildId: string, state: BuildState): Promise<void> {
  const projectRoot = getProjectRoot()
  const sessionsDir = getSessionsDir(projectRoot)
  await fs.mkdir(sessionsDir, { recursive: true })
  const filePath = path.join(sessionsDir, `${buildId}.json`)
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8")
}

export async function loadSessionState(buildId: string): Promise<BuildState | null> {
  const projectRoot = getProjectRoot()
  const filePath = path.join(getSessionsDir(projectRoot), `${buildId}.json`)
  try {
    const data = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(data)
    return BuildStateSchema.parse(parsed)
  } catch {
    return null
  }
}

export async function listSessions(): Promise<string[]> {
  const projectRoot = getProjectRoot()
  const sessionsDir = getSessionsDir(projectRoot)
  try {
    const files = await fs.readdir(sessionsDir)
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  } catch {
    return []
  }
}
