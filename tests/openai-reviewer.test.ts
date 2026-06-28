import { describe, it, expect, vi } from "vitest"

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify({ passed: true, issues: [], score: 0.95, commitMessage: "feat: implement" }) } }],
        }),
      },
    },
  })),
}))

describe("OpenAIReviewer", () => {
  it("reviews code", async () => {
    const { OpenAIReviewer } = await import("../src/providers/reviewer/openai.js")
    const reviewer = new OpenAIReviewer("sk-test")
    const result = await reviewer.review("build auth", "code", "PASS")
    expect(result.passed).toBe(true)
    expect(result.score).toBe(0.95)
  })
})
