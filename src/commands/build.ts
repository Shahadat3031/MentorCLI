import fs from "fs/promises"
import path from "path"
import chalk from "chalk"
import { ProviderRegistry } from "../providers/registry.js"
import { Orchestrator } from "../orchestrator/index.js"

export async function buildCommand(prdFile: string): Promise<void> {
  try {
    const prdPath = path.resolve(process.cwd(), prdFile)
    let prd: string
    try {
      prd = await fs.readFile(prdPath, "utf-8")
    } catch {
      console.log(chalk.red(`Cannot read PRD file: ${prdFile}`))
      return
    }

    const registry = new ProviderRegistry()
    await registry.init()

    const orchestrator = new Orchestrator(registry)
    await orchestrator.build(prd)
  } catch (e) {
    console.log(chalk.red(`Build failed: ${e instanceof Error ? e.message : String(e)}`))
  }
}
