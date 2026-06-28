import { ChatProvider } from "./index.js"
import { ChatMessage } from "../../types/index.js"

interface GeminiContent {
  role: "user" | "model"
  parts: { text: string }[]
}

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[]
}

export class GeminiChat implements ChatProvider {
  readonly name = "gemini"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system")
    const history = messages.filter((m) => m.role !== "system")

    const contents: GeminiContent[] = history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
        contents,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) throw new Error("Gemini: quota exceeded. Wait a moment.")
      if (response.status === 400) throw new Error("Gemini: invalid request. Check GEMINI_API_KEY in ~/.mentor/.env")
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as GeminiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("Empty Gemini response")
    return text
  }
}
