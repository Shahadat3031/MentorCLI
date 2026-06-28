import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"

interface GroqResponse {
  choices: { message: { content: string } }[]
}

export class GroqReviewer implements ReviewerProvider {
  readonly name = "groq"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "mixtral-8x7b-32768") {
    this.apiKey = apiKey
    this.model = model
  }

  async review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

Return JSON: { passed: boolean, issues: string[], score: number (0-1), commitMessage: string | null }`,
          },
          {
            role: "user",
            content: JSON.stringify({ task: taskDescription, code, testOutput }),
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GroqResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")

    return JSON.parse(content) as ReviewResult
  }
}
