import { execSync } from "child_process"
import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"

export class ShellExecutor implements ExecutorProvider {
  readonly name = "shell"

  async execute(task: Task, _prd: string, _projectType: string, _projectFiles: string): Promise<ExecutionResult> {
    const output = execSync(task.description, { encoding: "utf-8", timeout: 30000 })
    return {
      changedFiles: [],
      summary: output.trim(),
    }
  }

  async fix(task: Task, _prd: string, _issues: string[], _projectFiles: string): Promise<ExecutionResult> {
    const output = execSync(task.description, { encoding: "utf-8", timeout: 30000 })
    return {
      changedFiles: [],
      summary: output.trim(),
    }
  }
}
