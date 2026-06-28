import fs from "fs/promises"
import path from "path"
import { getLogsDir, getProjectRoot } from "../config/index.js"

type LogChannel = "planner" | "executor" | "reviewer" | "tester" | "git" | "human"

class Logger {
  private buildId: string | null = null

  setBuildId(id: string): void {
    this.buildId = id
  }

  async log(channel: LogChannel, message: string, data?: Record<string, unknown>): Promise<void> {
    if (!this.buildId) return

    const projectRoot = getProjectRoot()
    const logsDir = path.join(getLogsDir(projectRoot), this.buildId)
    await fs.mkdir(logsDir, { recursive: true })

    const logFile = path.join(logsDir, `${channel}.log`)
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      input: data || {},
      output: null,
      errors: null,
    }

    await fs.appendFile(logFile, JSON.stringify(entry) + "\n", "utf-8")
  }

  async writeError(channel: LogChannel, error: Error): Promise<void> {
    if (!this.buildId) return

    const projectRoot = getProjectRoot()
    const logsDir = path.join(getLogsDir(projectRoot), this.buildId)
    await fs.mkdir(logsDir, { recursive: true })

    const logFile = path.join(logsDir, `${channel}.log`)
    const entry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      input: {},
      output: null,
      errors: { message: error.message, stack: error.stack },
    }

    await fs.appendFile(logFile, JSON.stringify(entry) + "\n", "utf-8")
  }

  async getLogs(buildId: string): Promise<Record<string, string>> {
    const projectRoot = getProjectRoot()
    const logsDir = path.join(getLogsDir(projectRoot), buildId)
    const channels: LogChannel[] = ["planner", "executor", "reviewer", "tester", "git", "human"]
    const result: Record<string, string> = {}

    for (const channel of channels) {
      const logFile = path.join(logsDir, `${channel}.log`)
      try {
        result[channel] = await fs.readFile(logFile, "utf-8")
      } catch {
        result[channel] = ""
      }
    }

    return result
  }
}

export const logger = new Logger()
