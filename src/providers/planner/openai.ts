import OpenAI from "openai"
import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"

export class OpenAIPlanner implements PlannerProvider {
  readonly name = "openai"
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model = "gpt-4.1") {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async plan(prd: string, projectType: string): Promise<Task[]> {
    const response = await this.client.chat.completions.create({
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
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty OpenAI response")

    const parsed = JSON.parse(content)
    return parsed.tasks as Task[]
  }
}
