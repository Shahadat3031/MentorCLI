import { describe, it, expect, vi } from "vitest"

vi.mock("simple-git", () => {
  const mockGit = {
    status: vi.fn().mockResolvedValue({ current: "master", files: [] }),
    diff: vi.fn().mockResolvedValue("diff content"),
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue({ commit: "abc123" }),
    checkout: vi.fn().mockResolvedValue(undefined),
    log: vi.fn().mockResolvedValue({ latest: { hash: "abc123" } }),
  }
  return {
    default: vi.fn(() => mockGit),
  }
})

describe("GitManager", () => {
  it("returns status", async () => {
    const { gitManager } = await import("../src/git/index.js")
    const status = await gitManager.status()
    expect(status).toBeTruthy()
  })

  it("returns diff", async () => {
    const { gitManager } = await import("../src/git/index.js")
    const diff = await gitManager.diff()
    expect(diff).toBe("diff content")
  })

  it("commits changes", async () => {
    const { gitManager } = await import("../src/git/index.js")
    const hash = await gitManager.commit("test message")
    expect(hash).toBe("abc123")
  })

  it("rolls back changes", async () => {
    const { gitManager } = await import("../src/git/index.js")
    await expect(gitManager.rollback()).resolves.toBeUndefined()
  })
})
