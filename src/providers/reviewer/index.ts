import { ReviewResult, ProviderInfo } from "../../types/index.js"

export interface ReviewerProvider {
  readonly name: string
  review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult>
}

export function getReviewerInfo(): Record<string, ProviderInfo> {
  return {
    openrouter: { name: "OpenRouter", description: "OpenRouter AI (multiple models)" },
    groq: { name: "Groq", description: "Groq cloud inference" },
    ollama: { name: "Ollama", description: "Local Ollama models" },
    mock: { name: "Mock", description: "Mock reviewer for testing" },
  }
}
