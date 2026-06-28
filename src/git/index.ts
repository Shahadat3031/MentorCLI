import simpleGit from "simple-git"
import path from "path"

class GitManager {
  private git

  constructor() {
    this.git = simpleGit(process.cwd())
  }

  async status(): Promise<string> {
    const status = await this.git.status()
    return JSON.stringify(status, null, 2)
  }

  async diff(): Promise<string> {
    return this.git.diff()
  }

  async commit(message: string): Promise<string> {
    await this.git.add(".")
    const result = await this.git.commit(message)
    return result.commit
  }

  async rollback(): Promise<void> {
    await this.git.checkout(".")
  }

  async getLastCommitHash(): Promise<string> {
    const log = await this.git.log({ maxCount: 1 })
    return log.latest?.hash || ""
  }

  async isRepo(): Promise<boolean> {
    try {
      await this.git.status()
      return true
    } catch {
      return false
    }
  }
}

export const gitManager = new GitManager()
