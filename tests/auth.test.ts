import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs/promises"
import path from "path"
import os from "os"

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    models: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  })),
}))

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "ok" }],
      }),
    },
  })),
}))

const AUTH_FILE = path.join(os.homedir(), ".mentor", "auth.json")

describe("AuthManager", () => {
  beforeEach(async () => {
    try {
      await fs.unlink(AUTH_FILE)
    } catch {
      // file doesn't exist
    }
  })

  it("loads empty config when no auth file", async () => {
    const { authManager } = await import("../src/auth/index.js")
    const config = await authManager.loadConfig()
    expect(config).toEqual({})
  })

  it("saves and loads API key", async () => {
    const { authManager } = await import("../src/auth/index.js")
    await authManager.saveKey("openai", "sk-test-key")
    const key = await authManager.getKey("openai")
    expect(key).toBe("sk-test-key")
  })

  it("removes API key", async () => {
    const { authManager } = await import("../src/auth/index.js")
    await authManager.saveKey("openai", "sk-test-key")
    await authManager.removeKey("openai")
    const key = await authManager.getKey("openai")
    expect(key).toBeNull()
  })

  it("validates OpenAI key via API call", async () => {
    const { authManager } = await import("../src/auth/index.js")
    const valid = await authManager.validateKey("openai", "sk-test-key")
    expect(valid).toBe(true)
  })

  it("validates Anthropic key via API call", async () => {
    const { authManager } = await import("../src/auth/index.js")
    const valid = await authManager.validateKey("anthropic", "sk-ant-test-key")
    expect(valid).toBe(true)
  })
})
