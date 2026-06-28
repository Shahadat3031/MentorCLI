import { describe, it, expect } from "vitest"
import { createInitialState } from "../src/workflow/state.js"

describe("Workflow State", () => {
  it("creates initial state", () => {
    const state = createInitialState("build_test_001", "# PRD", "node")
    expect(state.buildId).toBe("build_test_001")
    expect(state.status).toBe("running")
    expect(state.modules).toEqual([])
    expect(state.retries).toBe(0)
  })

  it("creates different state for flutter", () => {
    const state = createInitialState("build_test_002", "# PRD", "flutter")
    expect(state.projectType).toBe("flutter")
  })
})

describe("Retry Policy", () => {
  it("exports correct retry limits", async () => {
    const { RETRY_POLICY } = await import("../src/config/index.js")
    expect(RETRY_POLICY.MAX_FIX_ATTEMPTS).toBe(5)
    expect(RETRY_POLICY.MAX_TEST_RETRIES).toBe(3)
    expect(RETRY_POLICY.MAX_REVIEW_RETRIES).toBe(3)
    expect(RETRY_POLICY.MAX_PLANNER_ESCALATIONS).toBe(2)
  })
})

describe("Session Persistence", () => {
  it("saves and loads session state", async () => {
    const { saveSessionState, loadSessionState } = await import(
      "../src/workflow/index.js"
    )
    const state = createInitialState("build_test_003", "# PRD", "node")

    await expect(saveSessionState("build_test_003", state)).resolves.toBeUndefined()

    const loaded = await loadSessionState("build_test_003")
    expect(loaded).not.toBeNull()
    expect(loaded?.buildId).toBe("build_test_003")
  })
})
