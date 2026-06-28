import chalk from "chalk"
import { ProviderRegistry } from "../providers/registry.js"
import { runTests, detectProjectType } from "../tests/index.js"
import { GitEngine } from "../git/index.js"
import { saveSession, loadSession, generateSessionId } from "../sessions/index.js"
import { SessionState, Task, TestResult } from "../types/index.js"
import { MAX_AGENT_TURNS, MAX_FIX_ATTEMPTS } from "../config/index.js"

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
      session.completedTasks.push(task.name)
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

    const projectFiles = await this.scanProjectFiles()

    let summary = ""
    let attempts = 0

    while (attempts < MAX_AGENT_TURNS) {
      attempts++
      session.agentTurns = attempts
      await saveSession(session)

      console.log(chalk.green(`  Attempt ${attempts}/${MAX_AGENT_TURNS}`))

      const execResult = await executor.execute(task, session.prd, session.projectType, projectFiles)
      summary = execResult.summary

      console.log(chalk.gray(`  ${execResult.summary}`))

      console.log(chalk.yellow("\n=== Testing ==="))
      const testResult = await runTests(this.projectDir)
      this.printTestResult(testResult)

      if (!testResult.passed) {
        console.log(chalk.yellow("\n=== Fixing Issues ==="))
        let fixAttempts = 0
        while (fixAttempts < MAX_FIX_ATTEMPTS) {
          fixAttempts++
          session.fixAttempts = fixAttempts
          await saveSession(session)

          console.log(chalk.yellow(`  Fix attempt ${fixAttempts}/${MAX_FIX_ATTEMPTS}`))

          const issues = this.parseTestErrors(testResult.output)
          await executor.fix(task, session.prd, issues, projectFiles)

          const retestResult = await runTests(this.projectDir)
          this.printTestResult(retestResult)

          if (retestResult.passed) {
            testResult.passed = true
            break
          }
        }

        if (!testResult.passed) {
          session.failedTasks.push(task.name)
          console.log(chalk.red(`  Failed to fix ${task.name}`))
          return { summary }
        }
      }

      console.log(chalk.magenta("\n=== Reviewing ==="))
      const reviewResult = await reviewer.review(
        task.description,
        execResult.code || "",
        testResult.output
      )

      if (reviewResult.passed) {
        console.log(chalk.green(`  Review passed (score: ${reviewResult.score})`))
        if (reviewResult.commitMessage) {
          console.log(chalk.cyan("\n=== Committing ==="))
          try {
            this.git.commit(reviewResult.commitMessage)
            console.log(chalk.green(`  Committed: ${reviewResult.commitMessage}`))
          } catch (e) {
            console.log(chalk.yellow(`  Git commit skipped: ${e instanceof Error ? e.message : String(e)}`))
          }
        }
        return { summary }
      }

      console.log(chalk.yellow(`  Review failed: ${reviewResult.issues.join(", ")}`))
    }

    session.failedTasks.push(task.name)
    console.log(chalk.red(`  Exceeded max turns for ${task.name}`))
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
      session.completedTasks.push(task.name)
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
        "find src lib app -type f -maxdepth 4 2>/dev/null | head -25 | xargs -I{} sh -c 'echo \"=== {} ===\" && cat {}'",
        { cwd: this.projectDir, encoding: "utf-8", timeout: 5000 }
      )
    } catch {
      return ""
    }
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
