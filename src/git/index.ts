import { execSync } from "child_process"
import fs from "fs/promises"
import path from "path"

export class GitEngine {
  private repoDir: string

  constructor(repoDir: string = process.cwd()) {
    this.repoDir = repoDir
  }

  async isRepo(): Promise<boolean> {
    try {
      execSync("git rev-parse --git-dir", { cwd: this.repoDir, encoding: "utf-8", stdio: "pipe" })
      return true
    } catch {
      return false
    }
  }

  async initIfNeeded(): Promise<void> {
    if (await this.isRepo()) return
    await fs.mkdir(this.repoDir, { recursive: true })
    execSync("git init", { cwd: this.repoDir, encoding: "utf-8", stdio: "pipe" })
    execSync('git config user.email "mentor@cli.local"', { cwd: this.repoDir, stdio: "pipe" })
    execSync('git config user.name "MentorCLI"', { cwd: this.repoDir, stdio: "pipe" })
  }

  status(): string {
    return execSync("git status", { cwd: this.repoDir, encoding: "utf-8" })
  }

  diff(): string {
    return execSync("git diff", { cwd: this.repoDir, encoding: "utf-8" })
  }

  commit(message: string): string {
    execSync("git add .", { cwd: this.repoDir, encoding: "utf-8" })
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: this.repoDir,
      encoding: "utf-8",
    })
    return message
  }

  rollback(): void {
    execSync("git checkout -- .", { cwd: this.repoDir, encoding: "utf-8" })
  }

  async getLastCommitHash(): Promise<string> {
    try {
      return execSync("git rev-parse HEAD", { cwd: this.repoDir, encoding: "utf-8" }).trim()
    } catch {
      return ""
    }
  }

  async hasChanges(): Promise<boolean> {
    const diff = this.diff()
    return diff.length > 0
  }
}
