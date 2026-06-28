import OpenAI from "openai"
import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"

export class OpenAIReviewer implements ReviewerProvider {
  readonly name = "openai"
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model = "gpt-4.1") {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult> {
    const response = await this.client.chat.completions.create({
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
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty OpenAI response")

    return JSON.parse(content) as ReviewResult
  }
}
