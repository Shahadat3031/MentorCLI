import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
}

export class OpenRouterPlanner implements PlannerProvider {
  readonly name = "openrouter"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "openai/gpt-4o-mini") {
    this.apiKey = apiKey
    this.model = model
  }

  async plan(prd: string, projectType: string): Promise<Task[]> {
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
            content: `You are a senior software architect. Analyze the PRD and break it into implementation tasks.

Project type: ${projectType}

Return a JSON array of tasks: { tasks: [{ name: string, description: string, dependencies: string[] }] }

Rules:
- Tasks must be ordered by dependency
- Each task should produce a single coherent feature
- Dependencies reference other task names`,
          },
          { role: "user", content: prd },
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

    const parsed = JSON.parse(extractJson(content))
    return parsed.tasks as Task[]
  }
}
