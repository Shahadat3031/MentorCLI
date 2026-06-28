import { ExecutorProvider } from "./index.js"
import { Task, ExecutionResult } from "../../types/index.js"

interface OllamaResponse {
  message: { content: string }
}

export class OllamaExecutor implements ExecutorProvider {
  readonly name = "ollama"
  private baseUrl: string
  private model: string

  constructor(model = "qwen2.5-coder", baseUrl = "http://localhost:11434") {
    this.model = model
    this.baseUrl = baseUrl
  }

  async execute(task: Task, prd: string, projectType: string, projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildPrompt(task, prd, projectType, projectFiles, false)
    return this.callOllama(prompt)
  }

  async fix(task: Task, prd: string, issues: string[], projectFiles: string): Promise<ExecutionResult> {
    const prompt = this.buildFixPrompt(task, prd, issues, projectFiles)
    return this.callOllama(prompt)
  }

  private buildPrompt(task: Task, prd: string, projectType: string, projectFiles: string, _isFix: boolean): string {
    return `You are implementing a task for a ${projectType} project.

PRD: ${prd}

Task: ${task.name}
Description: ${task.description}

Current project files:
${projectFiles}

Implement this task. Return your response as JSON:
{ "changedFiles": ["list of changed files"], "summary": "brief summary", "code": "the code you wrote" }`
  }

  private buildFixPrompt(task: Task, prd: string, issues: string[], projectFiles: string): string {
    return `You are fixing issues in task "${task.name}".

PRD: ${prd}
Issues: ${issues.join("\n")}

Project files:
${projectFiles}

Fix the issues. Return your response as JSON:
{ "changedFiles": ["list of changed files"], "summary": "brief summary", "code": "the fixed code" }`
  }

  private async callOllama(prompt: string): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a senior software engineer. Write production-quality code.",
          },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OllamaResponse
    const content = data.message?.content
    if (!content) throw new Error("Empty Ollama response")

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExecutionResult
    }

    return { changedFiles: [], summary: content.trim() }
  }
}
