import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Orchestrator", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("builds with mock providers", async () => {
    vi.mock("child_process", () => ({
      execSync: vi.fn(() => ""),
    }))

    vi.mock("fs/promises", () => ({
      default: {
        readdir: vi.fn().mockResolvedValue(["package.json"]),
        readFile: vi.fn().mockResolvedValue("# Test PRD"),
        writeFile: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined),
        access: vi.fn().mockRejectedValue(new Error("not found")),
        unlink: vi.fn().mockResolvedValue(undefined),
      },
      readdir: vi.fn().mockResolvedValue(["package.json"]),
      readFile: vi.fn().mockResolvedValue("# Test PRD"),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      access: vi.fn().mockRejectedValue(new Error("not found")),
      unlink: vi.fn().mockResolvedValue(undefined),
    }))

    const { ProviderRegistry } = await import("../src/providers/registry.js")
    const { Orchestrator } = await import("../src/orchestrator/index.js")

    const registry = new ProviderRegistry({})
    await registry.init()

    const orchestrator = new Orchestrator(registry, "/tmp/test")
    const session = await orchestrator.build("# Test PRD")
    expect(session.status).toBe("completed")
  })
})
