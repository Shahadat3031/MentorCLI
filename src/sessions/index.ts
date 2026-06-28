import fs from "fs/promises"
import path from "path"
import { getSessionsDir } from "../config/index.js"
import { SessionState } from "../types/index.js"

export async function saveSession(session: SessionState): Promise<void> {
  const dir = getSessionsDir()
  await fs.mkdir(dir, { recursive: true })
  const filePath = path.join(dir, `${session.sessionId}.json`)
  await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8")
}

export async function loadSession(sessionId: string): Promise<SessionState | null> {
  try {
    const filePath = path.join(getSessionsDir(), `${sessionId}.json`)
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data) as SessionState
  } catch {
    return null
  }
}

export async function listSessions(): Promise<string[]> {
  try {
    const dir = getSessionsDir()
    const files = await fs.readdir(dir)
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""))
  } catch {
    return []
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const filePath = path.join(getSessionsDir(), `${sessionId}.json`)
    await fs.unlink(filePath)
  } catch {
    // ignore
  }
}

export function generateSessionId(): string {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0")
  return `session_${date}_${rand}`
}
