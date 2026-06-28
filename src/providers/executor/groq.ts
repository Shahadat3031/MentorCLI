import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"
import { parseFileBlocks, writeFiles } from "./file-writer.js"

interface GroqResponse {
  choices: { message: { content: string } }[]
}

export class GroqExecutor implements ExecutorProvider {
  readonly name = "groq"
  private apiKey: string
  private model: string
  private projectDir: string

  constructor(apiKey: string, model = "llama-3.3-70b-versatile", projectDir: string = process.cwd()) {
    this.apiKey = apiKey
    this.model = model
    this.projectDir = projectDir
  }

  async execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult> {
    return this.call(this.buildPrompt(task, prd, projectType, projectFiles))
  }

  async fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult> {
    return this.call(this.buildFixPrompt(task, prd, issues, projectFiles))
  }

  private buildPrompt(task: Task, prd: string, projectType: string, projectFiles: string): string {
    return `You are implementing a task for a ${projectType} project.

PRD: ${prd}

Task: ${task.name}
Description: ${task.description}

Current project files:
${projectFiles}

Implement this task. For each file you create or modify:

=== path/to/file ===
\`\`\`
file contents here
\`\`\`

Then at the end return a JSON summary:
\`\`\`json
{ "changedFiles": ["list of changed files"], "summary": "brief summary" }
\`\`\``
  }

  private buildFixPrompt(task: Task, prd: string, issues: string[], projectFiles: string): string {
    return `Fix these issues in task "${task.name}":

Issues:
${issues.join("\n")}

Current project files:
${projectFiles}

For each file you modify:

=== path/to/file ===
\`\`\`
fixed contents here
\`\`\`

Then at the end return a JSON summary:
\`\`\`json
{ "changedFiles": ["list of changed files"], "summary": "brief summary" }
\`\`\``
  }

  private async call(prompt: string): Promise<ExecutionResult> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: "You are a senior software engineer. Write production-quality code." },
          { role: "user", content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 429) throw new Error("Groq: rate limit hit. Wait a moment or switch provider.")
      if (response.status === 401) throw new Error("Groq: invalid API key. Check GROQ_API_KEY in ~/.mentor/.env")
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GroqResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")

    const blocks = parseFileBlocks(content)
    if (blocks.length > 0) {
      const changedFiles = await writeFiles(blocks, this.projectDir)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
      let summary = ""
      if (jsonMatch) {
        try {
          summary = (JSON.parse(jsonMatch[1].trim()) as { summary: string }).summary || ""
        } catch {
          summary = content.trim()
        }
      }
      return { changedFiles, summary }
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(extractJson(jsonMatch[0])) as ExecutionResult
      } catch {
        return { changedFiles: [], summary: content.trim() }
      }
    }

    return { changedFiles: [], summary: content.trim() }
  }
}
