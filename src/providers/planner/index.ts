import { Task, ProviderInfo } from "../../types/index.js"

export interface PlannerProvider {
  readonly name: string
  plan(prd: string, projectType: string): Promise<Task[]>
}

export function getPlannerInfo(): Record<string, ProviderInfo> {
  return {
    openrouter: { name: "OpenRouter", description: "OpenRouter AI (multiple models)" },
    groq: { name: "Groq", description: "Groq cloud inference" },
    gemini: { name: "Gemini", description: "Google Gemini" },
    ollama: { name: "Ollama", description: "Local Ollama models" },
    mock: { name: "Mock", description: "Mock planner for testing" },
  }
}
