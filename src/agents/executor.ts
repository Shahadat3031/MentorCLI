import Anthropic from "@anthropic-ai/sdk"
import { authManager } from "../auth/index.js"
import { ExecutorOutputSchema } from "../schemas/index.js"
import { BuildState, ExecutorOutput } from "../types/index.js"
import { scanProjectFiles } from "../tools/index.js"

class ExecutorAgent {
  private client: Anthropic | null = null

  async getClient(): Promise<Anthropic> {
    if (!this.client) {
      const apiKey = await authManager.getKey("anthropic")
      if (!apiKey) throw new Error("Anthropic API key not configured. Run `mentor login` first.")
      this.client = new Anthropic({ apiKey })
    }
    return this.client
  }

  async executeModule(state: BuildState, moduleName: string): Promise<ExecutorOutput> {
    const client = await this.getClient()
    const projectFiles = await scanProjectFiles(state.projectType)

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a senior software engineer. Implement the following module for the project.

PRD: ${state.prd}

Module to implement: ${moduleName}

Project type: ${state.projectType}

Current project files:
${JSON.stringify(projectFiles, null, 2)}

Rules:
1. Only modify project files in src/, lib/, or app/ directories
2. Never delete files without approval
3. Never run git operations
4. Never use rm, sudo, chmod, mkfs

Return valid JSON matching:
{ changedFiles: string[], summary: string, confidence: number (0-1), needsConsultation: boolean, question: string | null }`,
            },
          ],
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== "text") throw new Error("Unexpected response type from Claude")

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in Claude response")
    return ExecutorOutputSchema.parse(JSON.parse(jsonMatch[0]))
  }

  async fixIssues(state: BuildState, moduleName: string): Promise<ExecutorOutput> {
    const client = await this.getClient()
    const projectFiles = await scanProjectFiles(state.projectType)

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a senior software engineer fixing issues.

PRD: ${state.prd}

Module: ${moduleName}

Test output: ${state.testOutput}

Review issues: ${JSON.stringify(state.reviewOutput?.issues || [])}

Project files:
${JSON.stringify(projectFiles, null, 2)}

Fix all reported issues.

Return valid JSON matching:
{ changedFiles: string[], summary: string, confidence: number (0-1), needsConsultation: boolean, question: string | null }`,
            },
          ],
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== "text") throw new Error("Unexpected response type from Claude")

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in Claude response")
    return ExecutorOutputSchema.parse(JSON.parse(jsonMatch[0]))
  }
}

export const executorAgent = new ExecutorAgent()
