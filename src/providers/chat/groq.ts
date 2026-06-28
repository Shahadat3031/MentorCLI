import { ChatProvider } from "./index.js"
import { ChatMessage } from "../../types/index.js"

interface GroqResponse {
  choices: { message: { content: string } }[]
}

export class GroqChat implements ChatProvider {
  readonly name = "groq"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "llama-3.3-70b-versatile") {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
    })

    if (!response.ok) {
      if (response.status === 429) throw new Error("Groq: rate limit hit. Wait a moment.")
      if (response.status === 401) throw new Error("Groq: invalid API key. Check GROQ_API_KEY in ~/.mentor/.env")
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GroqResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty Groq response")
    return content
  }
}
