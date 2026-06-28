import { spawn } from "child_process"
import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"

export class OpenCodeExecutor implements ExecutorProvider {
  readonly name = "opencode"
  private opencodePath: string
  private model: string

  constructor(opencodePath = "opencode", model = "default") {
    this.opencodePath = opencodePath
    this.model = model
  }

  async execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildPrompt(task, prd, projectType, projectFiles, false)
    return this.runOpenCode(prompt)
  }

  async fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildFixPrompt(task, prd, issues, projectFiles)
    return this.runOpenCode(prompt)
  }

  private buildPrompt(task: Task, prd: string, projectType: string, projectFiles: string, _isFix: boolean): string {
    return `You are implementing a task for a ${projectType} project.

PRD: ${prd}

Task: ${task.name}
Description: ${task.description}

Current project files:
${projectFiles}

Implement this task. Modify only existing files in src/, lib/, or app/ directories.
Do not delete files. Do not run git commands.

Return your response as JSON:
{ "changedFiles": ["list of changed files"], "summary": "brief summary", "code": "the code you wrote or modified" }`
  }

  private buildFixPrompt(task: Task, prd: string, issues: string[], projectFiles: string): string {
    return `You are fixing issues in a ${task.name} task.

PRD: ${prd}
Issues to fix: ${issues.join("\n")}

Current project files:
${projectFiles}

Fix the issues. Return your response as JSON:
{ "changedFiles": ["list of changed files"], "summary": "brief summary", "code": "the fixed code" }`
  }

  private runOpenCode(prompt: string): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.opencodePath, ["--prompt", prompt], {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      })

      let stdout = ""
      let stderr = ""

      child.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString()
      })

      child.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString()
      })

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`OpenCode exited with code ${code}: ${stderr}`))
          return
        }

        const jsonMatch = stdout.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]) as ExecutionResult
            resolve(result)
          } catch {
            resolve({
              changedFiles: [],
              summary: stdout.trim() || stderr.trim(),
            })
          }
        } else {
          resolve({
            changedFiles: [],
            summary: stdout.trim() || stderr.trim(),
          })
        }
      })

      child.on("error", (err) => {
        reject(new Error(`Failed to spawn OpenCode: ${err.message}`))
      })
    })
  }
}
