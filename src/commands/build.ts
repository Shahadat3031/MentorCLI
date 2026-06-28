import fs from "fs/promises"
import path from "path"
import chalk from "chalk"
import ora from "ora"
import { runBuild, saveSessionState } from "../workflow/index.js"
import { detectProjectType, saveProjectType } from "../project/index.js"
import { getProjectRoot, ensureMentorDir } from "../config/index.js"

function generateBuildId(): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `build_${dateStr}_${random}`
}

export async function buildCommand(prdFile: string): Promise<void> {
  const spinner = ora(chalk.blue("Starting build...")).start()

  try {
    const projectRoot = getProjectRoot()
    const prdPath = path.resolve(projectRoot, prdFile)

    let prd: string
    try {
      prd = await fs.readFile(prdPath, "utf-8")
    } catch {
      spinner.fail(chalk.red(`Cannot read PRD file: ${prdFile}`))
      return
    }

    const projectType = await detectProjectType(projectRoot)
    await ensureMentorDir(projectRoot)
    await saveProjectType(projectRoot)

    const buildId = generateBuildId()
    spinner.text = chalk.blue(`Build ID: ${buildId}`)

    console.log(chalk.cyan(`\nProject type: ${projectType}`))
    console.log(chalk.cyan(`Build ID: ${buildId}\n`))

    await runBuild(prd, buildId)

    spinner.succeed(chalk.green(`Build ${buildId} completed`))
  } catch (e) {
    spinner.fail(chalk.red(`Build failed: ${e instanceof Error ? e.message : String(e)}`))
  }
}
