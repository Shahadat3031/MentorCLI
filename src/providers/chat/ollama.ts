import { ChatProvider } from "./index.js"
import { ChatMessage } from "../../types/index.js"

interface OllamaResponse {
  message: { content: string }
}

export class OllamaChat implements ChatProvider {
  readonly name = "ollama"
  private model: string
  private baseUrl: string

  constructor(model = "llama3.2", baseUrl = "http://localhost:11434") {
    this.model = model
    this.baseUrl = baseUrl
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, messages, stream: false }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}. Is Ollama running? Try: ollama serve`)
    }

    const data = (await response.json()) as OllamaResponse
    const content = data.message?.content
    if (!content) throw new Error("Empty Ollama response")
    return content
  }
}
