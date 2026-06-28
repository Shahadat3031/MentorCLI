import { describe, it, expect, vi } from "vitest"

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify({ tasks: [{ name: "auth", description: "Auth module", dependencies: [] }] }) } }],
        }),
      },
    },
  })),
}))

describe("OpenAIPlanner", () => {
  it("plans tasks from PRD", async () => {
    const { OpenAIPlanner } = await import("../src/providers/planner/openai.js")
    const planner = new OpenAIPlanner("sk-test")
    const tasks = await planner.plan("# Build auth", "node")
    expect(tasks).toHaveLength(1)
    expect(tasks[0].name).toBe("auth")
  })
})
