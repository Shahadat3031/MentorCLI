import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"

interface OllamaResponse {
  message: { content: string }
}

export class OllamaPlanner implements PlannerProvider {
  readonly name = "ollama"
  private baseUrl: string
  private model: string

  constructor(model = "qwen2.5-coder", baseUrl = "http://localhost:11434") {
    this.model = model
    this.baseUrl = baseUrl
  }

  async plan(prd: string, projectType: string): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a senior software architect. Analyze the PRD and break it into implementation tasks.

Project type: ${projectType}

Return a JSON object: { tasks: [{ name: string, description: string, dependencies: string[] }] }

Rules:
- Tasks must be ordered by dependency
- Each task should produce a single coherent feature
- Dependencies reference other task names`,
          },
          { role: "user", content: prd },
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

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.tasks as Task[]
  }
}
