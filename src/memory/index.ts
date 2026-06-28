import fs from "fs/promises"
import path from "path"
import { getMemoryDir, getProjectRoot } from "../config/index.js"

interface DecisionRecord {
  [key: string]: string
}

class MemorySystem {
  private decisionsPath: string | null = null

  private async ensurePath(): Promise<string> {
    if (!this.decisionsPath) {
      const projectRoot = getProjectRoot()
      this.decisionsPath = path.join(getMemoryDir(projectRoot), "decisions.json")
    }
    await fs.mkdir(path.dirname(this.decisionsPath), { recursive: true })
    return this.decisionsPath
  }

  async loadDecisions(): Promise<DecisionRecord> {
    const filePath = await this.ensurePath()
    try {
      const data = await fs.readFile(filePath, "utf-8")
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  async saveDecision(key: string, value: string): Promise<void> {
    const decisions = await this.loadDecisions()
    decisions[key] = value
    const filePath = await this.ensurePath()
    await fs.writeFile(filePath, JSON.stringify(decisions, null, 2), "utf-8")
  }

  async getDecision(key: string): Promise<string | null> {
    const decisions = await this.loadDecisions()
    return decisions[key] || null
  }
}

export const memorySystem = new MemorySystem()
