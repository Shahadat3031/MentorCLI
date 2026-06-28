import readline from "readline/promises"
import chalk from "chalk"
import { ProviderRegistry } from "../providers/registry.js"
import { ChatMessage } from "../types/index.js"

export async function chatCommand(): Promise<void> {
  const registry = new ProviderRegistry()
  await registry.init()

  const provider = registry.getChat()
  console.log(chalk.cyan(`\nMentor Chat (${provider.name})`))
  console.log(chalk.gray("Type your message. Use 'exit' or Ctrl+C to quit.\n"))

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are Mentor, an expert software engineering assistant. Help the user with coding, architecture, debugging, and technical questions. Be concise and practical.",
    },
  ]

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  rl.on("close", () => {
    console.log(chalk.gray("\nGoodbye!"))
    process.exit(0)
  })

  while (true) {
    const input = await rl.question(chalk.green("You: ")).catch(() => "exit")
    const trimmed = input.trim()

    if (!trimmed || trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
      rl.close()
      break
    }

    messages.push({ role: "user", content: trimmed })

    try {
      process.stdout.write(chalk.blue("Mentor: "))
      const reply = await provider.chat(messages)
      console.log(reply)
      console.log()
      messages.push({ role: "assistant", content: reply })
    } catch (err) {
      console.log(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`))
      messages.pop()
    }
  }
}
