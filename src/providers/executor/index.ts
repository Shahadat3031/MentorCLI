import { Task, ExecutionResult, ProviderInfo } from "../../types/index.js"

export interface ExecutorProvider {
  readonly name: string
  execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult>
  fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult>
}

export function getExecutorInfo(): Record<string, ProviderInfo> {
  return {
    opencode: { name: "OpenCode", description: "OpenCode AI coding agent" },
    ollama: { name: "Ollama", description: "Local Ollama models (qwen2.5-coder, deepseek-coder, codellama)" },
    shell: { name: "Shell", description: "Shell command executor" },
    mock: { name: "Mock", description: "Mock executor for testing" },
  }
}
