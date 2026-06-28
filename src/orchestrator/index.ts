import path from "path"
import chalk from "chalk"
import { ProviderRegistry } from "../providers/registry.js"
import { runTests, detectProjectType } from "../tests/index.js"
import { GitEngine } from "../git/index.js"
import { saveSession, loadSession, generateSessionId } from "../sessions/index.js"
import { SessionState, Task, TestResult } from "../types/index.js"
import { MAX_FIX_ATTEMPTS } from "../config/index.js"

export class Orchestrator {
  private registry: ProviderRegistry
  private git: GitEngine
  private projectDir: string

  constructor(registry: ProviderRegistry, projectDir: string = process.cwd()) {
    this.registry = registry
    this.projectDir = projectDir
    this.git = new GitEngine(projectDir)
  }

  async build(prd: string): Promise<SessionState> {
    await this.git.initIfNeeded()

    const projectType = await detectProjectType(this.projectDir)
    console.log(chalk.cyan(`Project type: ${projectType}`))

    const sessionId = generateSessionId()
    console.log(chalk.cyan(`Session: ${sessionId}\n`))

    const planner = this.registry.getPlanner()
    console.log(chalk.blue(`Planner: ${planner.name}`))

    console.log(chalk.blue("\n=== Planning ==="))
    const tasks = await planner.plan(prd, projectType)
    console.log(chalk.green(`Planned ${tasks.length} tasks`))
    tasks.forEach((t) => console.log(`  ${chalk.cyan("→")} ${t.name}`))

    const session: SessionState = {
      sessionId,
      prd,
      tasks,
      currentTask: 0,
      projectType,
      status: "running",
      agentTurns: 0,
      fixAttempts: 0,
      completedTasks: [],
      failedTasks: [],
      summary: "",
    }

    await saveSession(session)

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      session.currentTask = i
      session.status = "running"
      await saveSession(session)

      console.log(chalk.green(`\n=== Executing: ${task.name} ===`))
      const result = await this.executeTask(session, task)
      session.summary = result.summary || session.summary
      await saveSession(session)
    }

    session.status = "completed"
    await saveSession(session)
    console.log(chalk.green(`\n✓ Build complete: ${sessionId}`))

    return session
  }

  private async executeTask(session: SessionState, task: Task): Promise<{ summary: string }> {
    const executor = this.registry.getExecutor()
    const reviewer = this.registry.getReviewer()

    // Step 1: Write code
    const projectFiles = await this.scanProjectFiles()
    const execResult = await executor.execute(task, session.prd, session.projectType, projectFiles)
    const summary = execResult.summary
    console.log(chalk.gray(`  ${summary}`))

    // Step 2: Test
    console.log(chalk.yellow("\n=== Testing ==="))
    let testResult = await runTests(this.projectDir)
    this.printTestResult(testResult)

    // Step 3: Fix test failures
    if (!testResult.passed) {
      console.log(chalk.yellow("\n=== Fixing Test Issues ==="))
      let fixAttempts = 0
      while (fixAttempts < MAX_FIX_ATTEMPTS && !testResult.passed) {
        fixAttempts++
        session.fixAttempts = fixAttempts
        await saveSession(session)

        console.log(chalk.yellow(`  Fix attempt ${fixAttempts}/${MAX_FIX_ATTEMPTS}`))
        const issues = this.parseTestErrors(testResult.output)
        const currentFiles = await this.scanProjectFiles()
        await executor.fix(task, session.prd, issues, currentFiles)

        testResult = await runTests(this.projectDir)
        this.printTestResult(testResult)
      }

      if (!testResult.passed) {
        session.failedTasks.push(task.name)
        console.log(chalk.red(`  Could not fix test failures for: ${task.name}`))
        return { summary }
      }
    }

    // Step 4: Review
    console.log(chalk.magenta("\n=== Reviewing ==="))
    const code = execResult.code || (await this.readChangedFiles(execResult.changedFiles))
    const reviewResult = await reviewer.review(task.description, code, testResult.output)
    console.log(chalk.cyan(`  Score: ${reviewResult.score}`))

    // Step 5: Fix review issues
    if (!reviewResult.passed && reviewResult.issues.length > 0) {
      console.log(chalk.yellow(`  Issues: ${reviewResult.issues.join(", ")}`))
      console.log(chalk.yellow("\n=== Fixing Review Issues ==="))
      const currentFiles = await this.scanProjectFiles()
      await executor.fix(task, session.prd, reviewResult.issues, currentFiles)
      console.log(chalk.green("  Review issues fixed"))
    } else {
      console.log(chalk.green("  Review passed"))
    }

    // Step 6: Commit
    const commitMessage = reviewResult.commitMessage || `feat: implement ${task.name}`
    console.log(chalk.cyan("\n=== Committing ==="))
    try {
      this.git.commit(commitMessage)
      console.log(chalk.green(`  Committed: ${commitMessage}`))
    } catch (e) {
      console.log(chalk.yellow(`  Git commit skipped: ${e instanceof Error ? e.message : String(e)}`))
    }

    session.completedTasks.push(task.name)
    await saveSession(session)
    return { summary }
  }

  async resume(sessionId: string): Promise<SessionState> {
    const session = await loadSession(sessionId)
    if (!session) throw new Error(`Session not found: ${sessionId}`)

    console.log(chalk.cyan(`Resuming session ${sessionId}`))
    console.log(chalk.cyan(`Status: ${session.status}`))
    console.log(chalk.cyan(`Completed: ${session.completedTasks.join(", ") || "none"}`))

    if (session.status === "completed") {
      console.log(chalk.green("Session already completed"))
      return session
    }

    const remaining = session.tasks.slice(session.currentTask)
    for (const task of remaining) {
      if (session.completedTasks.includes(task.name)) continue

      console.log(chalk.green(`\n=== Executing: ${task.name} ===`))
      const result = await this.executeTask(session, task)
      session.summary = result.summary || session.summary
      await saveSession(session)
    }

    session.status = "completed"
    await saveSession(session)
    console.log(chalk.green(`\n✓ Build complete: ${sessionId}`))

    return session
  }

  private async scanProjectFiles(): Promise<string> {
    try {
      const { execSync } = await import("child_process")
      return execSync(
        "find . -type f -maxdepth 4 ! -path './.git/*' ! -path './node_modules/*' ! -path './dist/*' 2>/dev/null | head -40 | xargs -I{} sh -c 'echo \"=== {} ===\" && cat {}'",
        { cwd: this.projectDir, encoding: "utf-8", timeout: 5000 }
      )
    } catch {
      return ""
    }
  }

  private async readChangedFiles(filePaths: string[]): Promise<string> {
    const { readFile } = await import("fs/promises")
    const parts: string[] = []
    for (const relPath of filePaths) {
      try {
        const abs = path.join(this.projectDir, relPath)
        const content = await readFile(abs, "utf-8")
        parts.push(`=== ${relPath} ===\n${content}`)
      } catch {
        // file may not exist yet
      }
    }
    return parts.join("\n\n")
  }

  private parseTestErrors(output: string): string[] {
    return output
      .split("\n")
      .filter((l) => l.includes("FAIL") || l.includes("Error:") || l.includes("error:"))
      .map((l) => l.trim())
  }

  private printTestResult(result: TestResult): void {
    if (result.passed) {
      console.log(chalk.green("  Tests passed"))
    } else {
      console.log(chalk.red("  Tests failed"))
      const errors = this.parseTestErrors(result.output)
      errors.slice(0, 5).forEach((e) => console.log(chalk.red(`    ${e}`)))
    }
  }
}
