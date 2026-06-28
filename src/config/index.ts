import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs/promises"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT_DIR = path.resolve(__dirname, "../..")

export const MENTOR_DIR = ".mentor"
export const SESSIONS_DIR = path.join(MENTOR_DIR, "sessions")
export const LOGS_DIR = path.join(MENTOR_DIR, "logs")
export const MEMORY_DIR = path.join(MENTOR_DIR, "memory")
export const STATE_FILE = path.join(MENTOR_DIR, "state.json")
export const PROJECT_FILE = path.join(MENTOR_DIR, "project.json")

export const AUTH_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || "~",
  ".mentor",
  "auth.json"
)

export function getProjectRoot(): string {
  return process.cwd()
}

export function getMentorDir(projectRoot: string): string {
  return path.join(projectRoot, MENTOR_DIR)
}

export function getSessionsDir(projectRoot: string): string {
  return path.join(projectRoot, SESSIONS_DIR)
}

export function getLogsDir(projectRoot: string): string {
  return path.join(projectRoot, LOGS_DIR)
}

export function getMemoryDir(projectRoot: string): string {
  return path.join(projectRoot, MEMORY_DIR)
}

export function getStateFile(projectRoot: string): string {
  return path.join(projectRoot, STATE_FILE)
}

export function getProjectFile(projectRoot: string): string {
  return path.join(projectRoot, PROJECT_FILE)
}

export async function ensureMentorDir(projectRoot: string): Promise<void> {
  const dirs = [
    getMentorDir(projectRoot),
    getSessionsDir(projectRoot),
    getLogsDir(projectRoot),
    getMemoryDir(projectRoot),
  ]
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
  }
}

export const RETRY_POLICY = {
  MAX_FIX_ATTEMPTS: 5,
  MAX_TEST_RETRIES: 3,
  MAX_REVIEW_RETRIES: 3,
  MAX_PLANNER_ESCALATIONS: 2,
} as const

export const SCAN_MAX_DEPTH = 4
export const SCAN_MAX_FILES = 25

export const SCAN_SOURCE_DIRS = ["src", "lib", "app"]
export const SCAN_IGNORE_DIRS = ["node_modules", "build", "dist", "coverage", ".git"]

export const TERMINAL_COLORS = {
  planner: "blue",
  executor: "green",
  tester: "yellow",
  reviewer: "magenta",
  git: "cyan",
  human: "red",
} as const
