import { describe, it, expect } from "vitest"

describe("GitEngine", () => {
  it("detects git repo", async () => {
    const { GitEngine } = await import("../src/git/index.js")
    const git = new GitEngine(process.cwd())
    const isRepo = await git.isRepo()
    expect(isRepo).toBe(true)
  })

  it("returns diff", async () => {
    const { GitEngine } = await import("../src/git/index.js")
    const git = new GitEngine(process.cwd())
    const diff = git.diff()
    expect(typeof diff).toBe("string")
  })

  it("returns status", async () => {
    const { GitEngine } = await import("../src/git/index.js")
    const git = new GitEngine(process.cwd())
    const status = git.status()
    expect(status).toContain("On branch")
  })
})
