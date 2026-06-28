import fs from "fs/promises"
import path from "path"
import { AuthConfig, Provider } from "../types/index.js"
import { AuthConfigSchema } from "../schemas/index.js"
import { AUTH_FILE } from "../config/index.js"

class AuthManager {
  private authDir: string

  constructor() {
    this.authDir = path.dirname(AUTH_FILE)
  }

  async ensureAuthDir(): Promise<void> {
    await fs.mkdir(this.authDir, { recursive: true })
  }

  async loadConfig(): Promise<AuthConfig> {
    try {
      const data = await fs.readFile(AUTH_FILE, "utf-8")
      const parsed = JSON.parse(data)
      return AuthConfigSchema.parse(parsed)
    } catch {
      return {}
    }
  }

  async saveConfig(config: AuthConfig): Promise<void> {
    await this.ensureAuthDir()
    await fs.writeFile(AUTH_FILE, JSON.stringify(config, null, 2), "utf-8")
  }

  async saveKey(provider: Provider, apiKey: string): Promise<void> {
    const config = await this.loadConfig()
    config[provider] = { apiKey }
    await this.saveConfig(config)
  }

  async removeKey(provider: Provider): Promise<void> {
    const config = await this.loadConfig()
    delete config[provider]
    await this.saveConfig(config)
  }

  async getKey(provider: Provider): Promise<string | null> {
    const config = await this.loadConfig()
    return config[provider]?.apiKey ?? null
  }

  async validateKey(provider: Provider, apiKey: string): Promise<boolean> {
    try {
      if (provider === "openai") {
        const { default: OpenAI } = await import("openai")
        const client = new OpenAI({ apiKey })
        await client.models.list()
        return true
      } else if (provider === "anthropic") {
        const { default: Anthropic } = await import("@anthropic-ai/sdk")
        const client = new Anthropic({ apiKey })
        await client.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async isConnected(provider: Provider): Promise<boolean> {
    const key = await this.getKey(provider)
    if (!key) return false
    return this.validateKey(provider, key)
  }
}

export const authManager = new AuthManager()
