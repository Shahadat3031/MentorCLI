import { Task, ExecutionResult, ProviderInfo } from "../../types/index.js"

export interface ExecutorProvider {
  readonly name: string
  execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult>
  fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult>
}

export function getExecutorInfo(): Record<string, ProviderInfo> {
  return {
    opencode: { name: "OpenCode", description: "OpenCode AI coding agent" },
    openrouter: { name: "OpenRouter", description: "OpenRouter API (GPT-4o, Claude, etc.)" },
    groq: { name: "Groq", description: "Groq cloud inference — free tier (llama-3.3-70b)" },
    gemini: { name: "Gemini", description: "Google Gemini Flash — free tier" },
    ollama: { name: "Ollama", description: "Local Ollama models — completely free" },
    shell: { name: "Shell", description: "Shell command executor" },
    mock: { name: "Mock", description: "Mock executor for testing" },
  }
}
