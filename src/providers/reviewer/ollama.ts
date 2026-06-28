import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"

interface OllamaResponse {
  message: { content: string }
}

export class OllamaReviewer implements ReviewerProvider {
  readonly name = "ollama"
  private baseUrl: string
  private model: string

  constructor(model = "qwen2.5-coder", baseUrl = "http://localhost:11434") {
    this.model = model
    this.baseUrl = baseUrl
  }

  async review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a senior code reviewer. Review the implementation.

Return JSON: { passed: boolean, issues: string[], score: number (0-1), commitMessage: string | null }`,
          },
          {
            role: "user",
            content: JSON.stringify({ task: taskDescription, code, testOutput }),
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OllamaResponse
    const content = data.message?.content
    if (!content) throw new Error("Empty Ollama response")

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in Ollama response")

    return JSON.parse(jsonMatch[0]) as ReviewResult
  }
}
