import fs from "fs/promises"
import path from "path"
import os from "os"
import { MentorConfig } from "../types/index.js"

const MENTOR_DIR = path.join(os.homedir(), ".mentor")
const CONFIG_FILE = path.join(MENTOR_DIR, "config.json")

export async function ensureMentorDir(): Promise<void> {
  await fs.mkdir(MENTOR_DIR, { recursive: true })
  await fs.mkdir(path.join(MENTOR_DIR, "sessions"), { recursive: true })
}

export async function loadGlobalConfig(): Promise<MentorConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8")
    return JSON.parse(data) as MentorConfig
  } catch {
    const defaults: MentorConfig = {
      planner: "mock",
      executor: "mock",
      reviewer: "mock",
    }
    await saveGlobalConfig(defaults)
    return defaults
  }
}

export async function saveGlobalConfig(config: MentorConfig): Promise<void> {
  await ensureMentorDir()
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8")
}

export function getMentorDir(): string {
  return MENTOR_DIR
}

export function getSessionsDir(): string {
  return path.join(MENTOR_DIR, "sessions")
}

export const MAX_AGENT_TURNS = 6
export const MAX_FIX_ATTEMPTS = 5
