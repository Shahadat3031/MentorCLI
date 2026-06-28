import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"
import { extractJson } from "../../utils/index.js"
import { parseFileBlocks, writeFiles } from "./file-writer.js"

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
}

export class OpenRouterExecutor implements ExecutorProvider {
  readonly name = "openrouter"
  private apiKey: string
  private model: string
  private projectDir: string

  constructor(apiKey: string, model = "openai/gpt-4o-mini", projectDir: string = process.cwd()) {
    this.apiKey = apiKey
    this.model = model
    this.projectDir = projectDir
  }

  async execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildPrompt(task, prd, projectType, projectFiles, false)
    return this.callOpenRouter(prompt)
  }

  async fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildFixPrompt(task, prd, issues, projectFiles)
    return this.callOpenRouter(prompt)
  }

  private buildPrompt(task: Task, prd: string, projectType: string, projectFiles: string, _isFix: boolean): string {
    return `You are implementing a task for a ${projectType} project.

PRD: ${prd}

Task: ${task.name}
Description: ${task.description}

Current project files:
${projectFiles}

Implement this task. Modify only existing files in src/, lib/, or app/ directories.
Do not delete files. Do not run git commands.

For each file you create or modify, include it in the format:

=== path/to/file ===
\`\`\`
file contents here
\`\`\`

Then at the end, return a JSON summary:
\`\`\`json
{ "changedFiles": ["list of changed files"], "summary": "brief summary" }
\`\`\``
  }

  private buildFixPrompt(task: Task, prd: string, issues: string[], projectFiles: string): string {
    return `You are fixing issues in a ${task.name} task.

PRD: ${prd}
Issues to fix: ${issues.join("\n")}

Current project files:
${projectFiles}

Fix the issues. For each file you modify, include it in the format:

=== path/to/file ===
\`\`\`
fixed file contents here
\`\`\`

Then at the end, return a JSON summary:
\`\`\`json
{ "changedFiles": ["list of changed files"], "summary": "brief summary" }
\`\`\``
  }

  private async callOpenRouter(prompt: string): Promise<ExecutionResult> {
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
            content: "You are a senior software engineer. Write production-quality code.",
          },
          { role: "user", content: prompt },
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

    const blocks = parseFileBlocks(content)
    if (blocks.length > 0) {
      const changedFiles = await writeFiles(blocks, this.projectDir)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
      let summary = ""
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim())
          summary = parsed.summary || ""
        } catch {
          summary = content.trim()
        }
      }
      return { changedFiles, summary }
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(extractJson(jsonMatch[0])) as ExecutionResult
        return parsed
      } catch {
        return { changedFiles: [], summary: content.trim() }
      }
    }

    return { changedFiles: [], summary: content.trim() }
  }
}
