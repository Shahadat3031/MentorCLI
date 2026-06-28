import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs/promises"
import path from "path"
import os from "os"

const CONFIG_FILE = path.join(os.homedir(), ".mentor", "config.json")

describe("Config", () => {
  beforeEach(async () => {
    vi.resetModules()
    try { await fs.unlink(CONFIG_FILE) } catch {}
  })

  it("creates default config when missing", async () => {
    const { loadGlobalConfig } = await import("../src/config/index.js")
    const config = await loadGlobalConfig()
    expect(config.planner).toBe("mock")
    expect(config.executor).toBe("mock")
    expect(config.reviewer).toBe("mock")
  })

  it("saves and loads config", async () => {
    const { saveGlobalConfig, loadGlobalConfig } = await import("../src/config/index.js")
    await saveGlobalConfig({ planner: "openrouter", executor: "opencode", reviewer: "ollama" })
    const config = await loadGlobalConfig()
    expect(config.planner).toBe("openrouter")
    expect(config.executor).toBe("opencode")
  })
})
