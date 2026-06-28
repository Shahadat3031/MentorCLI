import fs from "fs/promises"
import { Stats } from "fs"
import path from "path"
import { execSync } from "child_process"
import { ProjectType, BuildState, ReviewOutput } from "../types/index.js"
import { plannerAgent } from "../agents/planner.js"
import { SCAN_MAX_DEPTH, SCAN_MAX_FILES, SCAN_SOURCE_DIRS, SCAN_IGNORE_DIRS } from "../config/index.js"

export interface ScanResult {
  filePath: string
  content: string
}

export interface TestResult {
  output: string
  exitCode: number
  errors: Array<{ type: string; file: string; message: string }>
}

export async function scanProjectFiles(projectType: ProjectType): Promise<ScanResult[]> {
  const root = process.cwd()
  const files: ScanResult[] = []

  async function scan(dir: string, depth: number): Promise<void> {
    if (depth > SCAN_MAX_DEPTH || files.length >= SCAN_MAX_FILES) return

    let entries: string[]
    try {
      entries = await fs.readdir(dir)
    } catch {
      return
    }

    for (const entry of entries) {
      if (SCAN_IGNORE_DIRS.includes(entry)) continue
      const fullPath = path.join(dir, entry)
      let stat: Stats
      try {
        stat = await fs.stat(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        await scan(fullPath, depth + 1)
      } else if (stat.isFile()) {
        if (files.length >= SCAN_MAX_FILES) return
        try {
          const content = await fs.readFile(fullPath, "utf-8")
          files.push({ filePath: path.relative(root, fullPath), content })
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  for (const sourceDir of SCAN_SOURCE_DIRS) {
    const dirPath = path.join(root, sourceDir)
    try {
      await fs.access(dirPath)
      await scan(dirPath, 0)
    } catch {
      // directory doesn't exist, skip
    }
  }

  return files
}

export async function runTests(projectType: ProjectType): Promise<TestResult> {
  try {
    let output: string
    let exitCode: number

    if (projectType === "flutter") {
      try {
        output = execSync("flutter test 2>&1 && flutter analyze 2>&1", {
          encoding: "utf-8",
          timeout: 120000,
        })
        exitCode = 0
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; status?: number }
        output = err.stdout || err.stderr || String(e)
        exitCode = err.status ?? 1
      }
    } else {
      try {
        output = execSync("npm test 2>&1 && npm run lint 2>&1 && npm run build 2>&1", {
          encoding: "utf-8",
          timeout: 120000,
        })
        exitCode = 0
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; status?: number }
        output = err.stdout || err.stderr || String(e)
        exitCode = err.status ?? 1
      }
    }

    const errors = parseTestErrors(output)
    return { output, exitCode, errors }
  } catch (e) {
    return {
      output: String(e),
      exitCode: 1,
      errors: [{ type: "runtime_error", file: "", message: String(e) }],
    }
  }
}

function parseTestErrors(output: string): Array<{ type: string; file: string; message: string }> {
  const errors: Array<{ type: string; file: string; message: string }> = []
  const lines = output.split("\n")
  for (const line of lines) {
    if (line.includes("Error:") || line.includes("FAILED") || line.includes("error:")) {
      errors.push({
        type: line.includes("Error:") ? "error" : "test_failure",
        file: extractFileName(line),
        message: line.trim(),
      })
    }
  }
  return errors
}

function extractFileName(line: string): string {
  const match = line.match(/(?:\.\/)?([\w/.-]+\.[a-z]+)/i)
  return match ? match[1] : ""
}

export async function reviewModule(state: BuildState): Promise<ReviewOutput> {
  return plannerAgent.review(
    state.prd,
    state.currentModule || state.pendingModules[0] || "",
    state.generatedFiles || [],
    state.testOutput
  )
}

export function validateProjectRoot(projectRoot: string): boolean {
  return path.isAbsolute(projectRoot)
}

export function isPathInProject(filePath: string, projectRoot: string): boolean {
  const relative = path.relative(projectRoot, filePath)
  return !relative.startsWith("..") && !path.isAbsolute(relative)
}

const DANGEROUS_COMMANDS = ["rm", "sudo", "chmod", "mkfs"]

export function containsDangerousCommand(command: string): boolean {
  return DANGEROUS_COMMANDS.some((cmd) => command.includes(cmd))
}
