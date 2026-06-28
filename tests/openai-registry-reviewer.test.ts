import { describe, it, expect, vi } from "vitest"

vi.mock("../src/config/index.js", () => ({
  loadGlobalConfig: vi.fn().mockResolvedValue({
    planner: "mock",
    executor: "mock",
    reviewer: "openai",
  }),
  MAX_AGENT_TURNS: 6,
  MAX_FIX_ATTEMPTS: 5,
}))

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({ chat: { completions: { create: vi.fn() } } })),
}))

describe("Provider Registry - OpenAI Reviewer", () => {
  it("resolves OpenAI reviewer", async () => {
    const { ProviderRegistry } = await import("../src/providers/registry.js")
    const registry = new ProviderRegistry({ OPENAI_API_KEY: "sk-test" })
    await registry.init()
    const reviewer = registry.getReviewer()
    expect(reviewer.name).toBe("openai")
  })

  it("throws on missing OPENAI_API_KEY", async () => {
    const { ProviderRegistry } = await import("../src/providers/registry.js")
    const registry = new ProviderRegistry({})
    await registry.init()
    expect(() => registry.getReviewer()).toThrow("OPENAI_API_KEY")
  })
})
