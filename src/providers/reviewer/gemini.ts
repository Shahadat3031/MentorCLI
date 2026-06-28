import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[]
}

export class GeminiReviewer implements ReviewerProvider {
  readonly name = "gemini"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.apiKey = apiKey
    this.model = model
  }

  async review(taskDescription: string, code: string, testOutput: string): Promise<ReviewResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a senior code reviewer. Review this implementation.

Task: ${taskDescription}

Code:
${code}

Test output:
${testOutput}

Return ONLY valid JSON (no markdown):
{ "passed": boolean, "issues": string[], "score": number, "commitMessage": string | null }

If passed is true, provide a conventional commit message. If false, list specific issues to fix.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 429) throw new Error("Gemini: quota exceeded. Wait or switch provider.")
      if (response.status === 400) throw new Error("Gemini: invalid request. Check GEMINI_API_KEY in ~/.mentor/.env")
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GeminiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("Empty Gemini response")

    return JSON.parse(extractJson(text)) as ReviewResult
  }
}
