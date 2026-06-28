import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("child_process", () => ({
  execSync: vi.fn().mockReturnValue("PASS\nAll tests passing"),
}))

const mockReaddir = vi.fn()
const mockAccess = vi.fn()

vi.mock("fs/promises", () => ({
  default: {
    readdir: mockReaddir,
    access: mockAccess,
  },
  readdir: mockReaddir,
  access: mockAccess,
}))

describe("TestEngine", () => {
  beforeEach(() => {
    mockReaddir.mockReset()
    mockAccess.mockReset()
  })

  it("detects Node.js project", async () => {
    mockReaddir.mockResolvedValue(["package.json"])
    const { detectProjectType } = await import("../src/tests/index.js")
    const type = await detectProjectType("/test")
    expect(type).toBe("node")
  })

  it("detects Flutter project", async () => {
    mockReaddir.mockResolvedValue(["pubspec.yaml"])
    const { detectProjectType } = await import("../src/tests/index.js")
    const type = await detectProjectType("/test")
    expect(type).toBe("flutter")
  })

  it("throws on unsupported project", async () => {
    mockReaddir.mockResolvedValue(["README.md"])
    const { detectProjectType } = await import("../src/tests/index.js")
    await expect(detectProjectType("/test")).rejects.toThrow("Unsupported project")
  })

  it("detects npm as default package manager", async () => {
    mockAccess.mockRejectedValue(new Error("not found"))
    const { detectPackageManager } = await import("../src/tests/index.js")
    const pm = await detectPackageManager("/test")
    expect(pm).toBe("npm")
  })

  it("runs tests successfully", async () => {
    mockReaddir.mockResolvedValue(["package.json"])
    mockAccess.mockRejectedValue(new Error("not found"))

    const { runTests } = await import("../src/tests/index.js")
    const result = await runTests("/test")
    expect(result.passed).toBe(true)
  })
})
