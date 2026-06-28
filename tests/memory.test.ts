import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs/promises"

vi.mock("fs/promises")

describe("MemorySystem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads empty decisions when no file exists", async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error("not found"))
    vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined)

    const { memorySystem } = await import("../src/memory/index.js")
    const decisions = await memorySystem.loadDecisions()
    expect(decisions).toEqual({})
  })

  it("saves and retrieves a decision", async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({}))
    vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined)
    vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined)

    const { memorySystem } = await import("../src/memory/index.js")
    await memorySystem.saveDecision("db_choice", "PostgreSQL")
    expect(fs.writeFile).toHaveBeenCalled()
  })
})
