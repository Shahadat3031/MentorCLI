import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"

interface GroqResponse {
  choices: { message: { content: string } }[]
}

export class GroqPlanner implements PlannerProvider {
  readonly name = "groq"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "mixtral-8x7b-32768") {
    this.apiKey = apiKey
    this.model = model
  }

  async plan(prd: string, projectType: string): Promise<Task[]> {
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
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GroqResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")

    const parsed = JSON.parse(extractJson(content))
    return parsed.tasks as Task[]
  }
}
