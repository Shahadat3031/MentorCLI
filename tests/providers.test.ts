import { describe, it, expect } from "vitest"
import { MockPlanner } from "../src/providers/planner/mock.js"
import { MockExecutor } from "../src/providers/executor/mock.js"
import { MockReviewer } from "../src/providers/reviewer/mock.js"

describe("MockPlanner", () => {
  it("returns predefined tasks", async () => {
    const planner = new MockPlanner()
    const tasks = await planner.plan("# PRD", "node")
    expect(tasks).toHaveLength(2)
    expect(tasks[0].name).toBe("auth")
  })
})

describe("MockExecutor", () => {
  it("returns mock execution result", async () => {
    const executor = new MockExecutor()
    const result = await executor.execute(
      { name: "auth", description: "auth module", dependencies: [] },
      "# PRD",
      "node",
      ""
    )
    expect(result.changedFiles).toContain("src/auth.ts")
    expect(result.summary).toContain("Implemented")
  })
})

describe("MockReviewer", () => {
  it("returns passing review", async () => {
    const reviewer = new MockReviewer()
    const result = await reviewer.review("task", "code", "test output")
    expect(result.passed).toBe(true)
    expect(result.score).toBe(0.95)
    expect(result.commitMessage).toBeDefined()
  })
})
