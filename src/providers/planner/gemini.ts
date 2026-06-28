import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[]
}

export class GeminiPlanner implements PlannerProvider {
  readonly name = "gemini"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.apiKey = apiKey
    this.model = model
  }

  async plan(prd: string, projectType: string): Promise<Task[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a senior software architect. Analyze the PRD and break it into implementation tasks.

Project type: ${projectType}

Return a JSON object: { tasks: [{ name: string, description: string, dependencies: string[] }] }

Rules:
- Tasks must be ordered by dependency
- Each task should produce a single coherent feature
- Dependencies reference other task names

PRD: ${prd}

Return ONLY valid JSON.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GeminiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("Empty Gemini response")

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in Gemini response")

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.tasks as Task[]
  }
}
