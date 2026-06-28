import { PlannerProvider } from "./planner/index.js"
import { ExecutorProvider } from "./executor/index.js"
import { ReviewerProvider } from "./reviewer/index.js"
import { ChatProvider } from "./chat/index.js"
import { MentorConfig } from "../types/index.js"
import { loadGlobalConfig } from "../config/index.js"

import { OpenAIPlanner } from "./planner/openai.js"
import { OpenRouterPlanner } from "./planner/openrouter.js"
import { GroqPlanner } from "./planner/groq.js"
import { GeminiPlanner } from "./planner/gemini.js"
import { OllamaPlanner } from "./planner/ollama.js"
import { MockPlanner } from "./planner/mock.js"

import { OpenCodeExecutor } from "./executor/opencode.js"
import { OpenRouterExecutor } from "./executor/openrouter.js"
import { GroqExecutor } from "./executor/groq.js"
import { GeminiExecutor } from "./executor/gemini.js"
import { OllamaExecutor } from "./executor/ollama.js"
import { ShellExecutor } from "./executor/shell.js"
import { MockExecutor } from "./executor/mock.js"

import { OpenAIReviewer } from "./reviewer/openai.js"
import { OpenRouterReviewer } from "./reviewer/openrouter.js"
import { GroqReviewer } from "./reviewer/groq.js"
import { GeminiReviewer } from "./reviewer/gemini.js"
import { OllamaReviewer } from "./reviewer/ollama.js"
import { MockReviewer } from "./reviewer/mock.js"

import { GroqChat } from "./chat/groq.js"
import { GeminiChat } from "./chat/gemini.js"
import { OllamaChat } from "./chat/ollama.js"
import { OpenRouterChat } from "./chat/openrouter.js"

export class ProviderRegistry {
  private config!: MentorConfig
  private env: Record<string, string | undefined>

  constructor(env: Record<string, string | undefined> = process.env) {
    this.env = env
  }

  async init(): Promise<void> {
    this.config = await loadGlobalConfig()
  }

  getPlanner(): PlannerProvider {
    switch (this.config.planner) {
      case "openai":
        return new OpenAIPlanner(this.getKey("OPENAI_API_KEY"))
      case "openrouter":
        return new OpenRouterPlanner(this.getKey("OPENROUTER_API_KEY"))
      case "groq":
        return new GroqPlanner(this.getKey("GROQ_API_KEY"))
      case "gemini":
        return new GeminiPlanner(this.getKey("GEMINI_API_KEY"))
      case "ollama":
        return new OllamaPlanner()
      case "mock":
        return new MockPlanner()
      default:
        throw new Error(`Unknown planner provider: ${this.config.planner}`)
    }
  }

  getExecutor(): ExecutorProvider {
    switch (this.config.executor) {
      case "opencode":
        return new OpenCodeExecutor()
      case "openrouter":
        return new OpenRouterExecutor(this.getKey("OPENROUTER_API_KEY"))
      case "groq":
        return new GroqExecutor(this.getKey("GROQ_API_KEY"))
      case "gemini":
        return new GeminiExecutor(this.getKey("GEMINI_API_KEY"))
      case "ollama":
        return new OllamaExecutor()
      case "shell":
        return new ShellExecutor()
      case "mock":
        return new MockExecutor()
      default:
        throw new Error(`Unknown executor provider: ${this.config.executor}`)
    }
  }

  getReviewer(): ReviewerProvider {
    switch (this.config.reviewer) {
      case "openai":
        return new OpenAIReviewer(this.getKey("OPENAI_API_KEY"))
      case "openrouter":
        return new OpenRouterReviewer(this.getKey("OPENROUTER_API_KEY"))
      case "groq":
        return new GroqReviewer(this.getKey("GROQ_API_KEY"))
      case "gemini":
        return new GeminiReviewer(this.getKey("GEMINI_API_KEY"))
      case "ollama":
        return new OllamaReviewer()
      case "mock":
        return new MockReviewer()
      default:
        throw new Error(`Unknown reviewer provider: ${this.config.reviewer}`)
    }
  }

  getChat(): ChatProvider {
    const groqKey = this.env["GROQ_API_KEY"]
    const geminiKey = this.env["GEMINI_API_KEY"]
    const openrouterKey = this.env["OPENROUTER_API_KEY"]

    // auto-pick best free provider, fall back to openrouter
    if (groqKey) return new GroqChat(groqKey)
    if (geminiKey) return new GeminiChat(geminiKey)
    if (openrouterKey) return new OpenRouterChat(openrouterKey)
    return new OllamaChat()
  }

  getConfig(): MentorConfig {
    return this.config
  }

  private getKey(name: string): string {
    const value = this.env[name]
    if (!value) throw new Error(`Missing ${name} environment variable`)
    return value
  }
}
