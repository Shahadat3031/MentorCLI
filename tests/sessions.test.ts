import { describe, it, expect, beforeEach } from "vitest"
import fs from "fs/promises"
import { getSessionsDir } from "../src/config/index.js"

describe("Sessions", () => {
  beforeEach(async () => {
    const dir = getSessionsDir()
    try { await fs.rm(dir, { recursive: true }) } catch {}
  })

  it("saves and loads a session", async () => {
    const { saveSession, loadSession } = await import("../src/sessions/index.js")
    const session = {
      sessionId: "test_001",
      prd: "# PRD",
      tasks: [{ name: "auth", description: "Auth module", dependencies: [] }],
      currentTask: 0,
      projectType: "node" as const,
      status: "running" as const,
      agentTurns: 0,
      fixAttempts: 0,
      completedTasks: [],
      failedTasks: [],
      summary: "",
    }
    await saveSession(session)
    const loaded = await loadSession("test_001")
    expect(loaded).not.toBeNull()
    expect(loaded!.sessionId).toBe("test_001")
  })

  it("lists sessions", async () => {
    const { saveSession, listSessions } = await import("../src/sessions/index.js")
    const session = {
      sessionId: "test_002",
      prd: "# PRD",
      tasks: [],
      currentTask: 0,
      projectType: "node" as const,
      status: "completed" as const,
      agentTurns: 0,
      fixAttempts: 0,
      completedTasks: [],
      failedTasks: [],
      summary: "",
    }
    await saveSession(session)
    const list = await listSessions()
    expect(list).toContain("test_002")
  })

  it("generates unique session IDs", async () => {
    const { generateSessionId } = await import("../src/sessions/index.js")
    const id1 = generateSessionId()
    const id2 = generateSessionId()
    expect(id1).not.toBe(id2)
    expect(id1).toMatch(/^session_\d{8}_\d{4}$/)
  })
})
