import { ChatProvider } from "./index.js"
import { ChatMessage } from "../../types/index.js"

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
}

export class OpenRouterChat implements ChatProvider {
  readonly name = "openrouter"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "openai/gpt-4o-mini") {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
    })

    if (!response.ok) {
      if (response.status === 402) throw new Error("OpenRouter: insufficient credits. Add credits at https://openrouter.ai/credits")
      if (response.status === 401) throw new Error("OpenRouter: invalid API key. Check OPENROUTER_API_KEY in ~/.mentor/.env")
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OpenRouterResponse
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error("Empty OpenRouter response")
    return content
  }
}
