import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
}

export class OpenRouterReviewer implements ReviewerProvider {
  readonly name = "openrouter"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "openai/gpt-4o-mini") {
    this.apiKey = apiKey
    this.model = model
  }

  async review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a senior code reviewer. Review the implementation.

Return JSON: { passed: boolean, issues: string[], score: number (0-1), commitMessage: string | null }

If passed is true, provide a conventional commit message in commitMessage.
If passed is false, list issues to fix.`,
          },
          {
            role: "user",
            content: JSON.stringify({ task: taskDescription, code, testOutput }),
          },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error("OpenRouter: insufficient credits. Add credits at https://openrouter.ai/credits or switch provider with: mentor config")
      }
      if (response.status === 401) {
        throw new Error("OpenRouter: invalid API key. Check OPENROUTER_API_KEY in ~/.mentor/.env")
      }
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OpenRouterResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty OpenRouter response")

    return JSON.parse(extractJson(content)) as ReviewResult
  }
}
