import { describe, it, expect } from "vitest"

describe("Safety Tools", () => {
  it("detects dangerous commands", async () => {
    const { containsDangerousCommand } = await import("../src/tools/index.js")
    expect(containsDangerousCommand("rm -rf /")).toBe(true)
    expect(containsDangerousCommand("sudo apt get")).toBe(true)
    expect(containsDangerousCommand("chmod 777")).toBe(true)
    expect(containsDangerousCommand("mkfs.ext4")).toBe(true)
    expect(containsDangerousCommand("npm install")).toBe(false)
    expect(containsDangerousCommand("git commit")).toBe(false)
  })

  it("validates project root paths", async () => {
    const { validateProjectRoot } = await import("../src/tools/index.js")
    expect(validateProjectRoot("/absolute/path")).toBe(true)
  })

  it("validates paths within project", async () => {
    const { isPathInProject } = await import("../src/tools/index.js")
    expect(isPathInProject("/project/src/file.ts", "/project")).toBe(true)
    expect(isPathInProject("/other/file.ts", "/project")).toBe(false)
  })
})
