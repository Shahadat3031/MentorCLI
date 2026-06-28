import { execSync } from "child_process"
import fs from "fs/promises"
import path from "path"
import { TestResult, ProjectType } from "../types/index.js"

export async function detectProjectType(projectDir: string): Promise<ProjectType> {
  const files = await fs.readdir(projectDir)
  if (files.includes("pubspec.yaml")) return "flutter"
  if (files.includes("package.json")) return "node"
  throw new Error("Unsupported project: no package.json or pubspec.yaml found")
}

export async function detectPackageManager(projectDir: string): Promise<string> {
  try {
    await fs.access(path.join(projectDir, "pnpm-lock.yaml"))
    return "pnpm"
  } catch {
    try {
      await fs.access(path.join(projectDir, "yarn.lock"))
      return "yarn"
    } catch {
      return "npm"
    }
  }
}

async function hasTestScript(projectDir: string): Promise<boolean> {
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(projectDir, "package.json"), "utf-8"))
    return !!pkg.scripts?.test
  } catch {
    return false
  }
}

async function hasTestFiles(projectDir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(projectDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.js") ||
          entry.name.endsWith(".spec.ts") || entry.name.endsWith(".spec.js") ||
          entry.name.endsWith("_test.dart") || entry.name === "test" && entry.isDirectory()) {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

export async function runTests(projectDir: string): Promise<TestResult> {
  const projectType = await detectProjectType(projectDir)

  if (projectType === "node") {
    const hasScript = await hasTestScript(projectDir)
    const hasFiles = await hasTestFiles(projectDir)
    if (!hasScript || !hasFiles) {
      return { passed: true, output: "No tests configured or no test files found", exitCode: 0 }
    }
  }

  try {
    let output: string
    let exitCode: number

    if (projectType === "flutter") {
      try {
        output = execSync("flutter test 2>&1", {
          cwd: projectDir,
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
      const pm = await detectPackageManager(projectDir)
      const testCmd = `${pm} test 2>&1`
      try {
        output = execSync(testCmd, { cwd: projectDir, encoding: "utf-8", timeout: 120000 })
        exitCode = 0
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; status?: number }
        output = err.stdout || err.stderr || String(e)
        exitCode = err.status ?? 1
      }
    }

    const passed = exitCode === 0
    return { passed, output, exitCode }
  } catch (e) {
    return { passed: false, output: String(e), exitCode: 1 }
  }
}
