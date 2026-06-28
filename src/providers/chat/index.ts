import { ChatMessage } from "../../types/index.js"

export interface ChatProvider {
  readonly name: string
  chat(messages: ChatMessage[]): Promise<string>
}

export { ChatMessage }
