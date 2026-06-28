import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs/promises"
import path from "path"
import os from "os"

vi.mock("fs/promises")

describe("Project Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("detects Node.js project", async () => {
    vi.mocked(fs.access).mockRejectedValueOnce(new Error("no pubspec"))
    vi.mocked(fs.access).mockResolvedValueOnce(undefined)

    const { detectProjectType } = await import("../src/project/index.js")
    const result = await detectProjectType("/test/project")
    expect(result).toBe("node")
  })

  it("detects Flutter project", async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined)

    const { detectProjectType } = await import("../src/project/index.js")
    const result = await detectProjectType("/test/project")
    expect(result).toBe("flutter")
  })

  it("throws on unsupported project type", async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error("not found"))

    const { detectProjectType } = await import("../src/project/index.js")
    await expect(detectProjectType("/test/project")).rejects.toThrow(
      "Unsupported project type"
    )
  })
})
