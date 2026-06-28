import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"

export class MockExecutor implements ExecutorProvider {
  readonly name = "mock"

  async execute(task: Task, _prd: string, _projectType: string, _projectFiles: string): Promise<ExecutionResult> {
    return {
      changedFiles: [`src/${task.name}.ts`],
      summary: `Implemented ${task.name}`,
      code: `// Mock implementation of ${task.name}`,
    }
  }

  async fix(task: Task, _prd: string, _issues: string[], _projectFiles: string): Promise<ExecutionResult> {
    return {
      changedFiles: [`src/${task.name}.ts`],
      summary: `Fixed ${task.name}`,
      code: `// Fixed implementation of ${task.name}`,
    }
  }
}
