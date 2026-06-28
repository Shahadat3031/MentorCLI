import chalk from "chalk"
import { plannerAgent } from "../agents/planner.js"
import { executorAgent } from "../agents/executor.js"
import { reviewModule, runTests } from "../tools/index.js"
import { gitManager } from "../git/index.js"
import { logger } from "../logs/index.js"
import { BuildState } from "../types/index.js"
import { RETRY_POLICY } from "../config/index.js"

export async function parsePrdNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("planner", "Parsing PRD...", { prd: state.prd })
  console.log(chalk.blue("\n=== Parsing PRD ==="))
  const result = await plannerAgent.parsePRD(state.prd)
  const modules = result.features.map((name: string, i: number) => ({
    name,
    dependencies: [],
  }))
  return {
    modules,
    pendingModules: modules.map((m: { name: string }) => m.name),
    currentNode: "parse_prd",
  }
}

export async function planModulesNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("planner", "Planning modules...", { modules: state.modules })
  console.log(chalk.blue("\n=== Planning Modules ==="))
  const result = await plannerAgent.planModules(state.prd, state.modules)
  return {
    modules: result,
    pendingModules: result.map((m) => m.name),
    currentNode: "plan_modules",
  }
}

export async function executeModuleNode(state: BuildState): Promise<Partial<BuildState>> {
  const moduleName = state.currentModule || state.pendingModules[0]
  logger.log("executor", `Executing module: ${moduleName}`, { module: moduleName })
  console.log(chalk.green(`\n=== Executing Module: ${moduleName} ===`))
  const result = await executorAgent.executeModule(state, moduleName)
  const newGeneratedFiles = [...(state.generatedFiles || []), ...result.changedFiles]
  const updates: Partial<BuildState> = {
    generatedFiles: newGeneratedFiles,
    currentNode: "execute_module",
  }
  if (result.needsConsultation) {
    logger.log("executor", "Executor needs consultation", { question: result.question })
    updates.consultationOutput = {
      resolved: false,
      confidence: result.confidence,
      needsHuman: false,
      question: result.question,
      answer: null,
    }
  }
  return updates
}

export async function consultPlannerNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("planner", "Consulting planner...", { question: state.consultationOutput?.question })
  console.log(chalk.blue("\n=== Consulting Planner ==="))
  const consultOutput = await plannerAgent.consult(
    state.prd,
    state.currentModule || "",
    state.consultationOutput?.question || ""
  )
  return {
    consultationOutput: consultOutput,
    currentNode: "consult_planner",
  }
}

export async function askHumanNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("human", "Asking human...", { question: state.consultationOutput?.question })
  console.log(chalk.red("\n=== Asking Human ==="))
  console.log(chalk.yellow(`Question: ${state.consultationOutput?.question}`))
  const { default: inquirer } = await import("inquirer")
  const { answer } = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: "Your answer:",
    },
  ])
  return {
    humanDecision: {
      question: state.consultationOutput?.question || "",
      answer,
    },
    currentNode: "ask_human",
  }
}

export async function runTestsNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("tester", "Running tests...")
  console.log(chalk.yellow("\n=== Running Tests ==="))
  const testResult = await runTests(state.projectType)
  const updates: Partial<BuildState> = {
    testOutput: testResult.output,
    currentNode: "run_tests",
  }
  if (testResult.exitCode !== 0) {
    logger.log("tester", "Tests failed", { output: testResult.output })
    updates.retries = (state.retries || 0) + 1
    updates.testRetries = (state.testRetries || 0) + 1
    if (updates.testRetries! >= RETRY_POLICY.MAX_TEST_RETRIES) {
      updates.status = "paused"
    }
  }
  return updates
}

export async function reviewModuleNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("reviewer", "Reviewing module...")
  console.log(chalk.magenta("\n=== Reviewing Module ==="))
  const reviewOutput = await reviewModule(state)
  const updates: Partial<BuildState> = {
    reviewOutput,
    currentNode: "review_module",
  }
  if (!reviewOutput.passed) {
    updates.retries = (state.retries || 0) + 1
    updates.reviewRetries = (state.reviewRetries || 0) + 1
    if (updates.reviewRetries! >= RETRY_POLICY.MAX_REVIEW_RETRIES) {
      updates.status = "paused"
    }
  }
  return updates
}

export async function fixIssuesNode(state: BuildState): Promise<Partial<BuildState>> {
  const moduleName = state.currentModule || state.pendingModules[0]
  logger.log("executor", `Fixing issues for module: ${moduleName}`, {
    reviewOutput: state.reviewOutput,
    testOutput: state.testOutput,
  })
  console.log(chalk.green("\n=== Fixing Issues ==="))
  const result = await executorAgent.fixIssues(state, moduleName)
  const updates: Partial<BuildState> = {
    generatedFiles: [...(state.generatedFiles || []), ...result.changedFiles],
    currentNode: "fix_issues",
  }
  if (state.retries >= RETRY_POLICY.MAX_FIX_ATTEMPTS) {
    updates.status = "paused"
  }
  return updates
}

export async function commitChangesNode(state: BuildState): Promise<Partial<BuildState>> {
  logger.log("git", "Committing changes...")
  console.log(chalk.cyan("\n=== Committing Changes ==="))
  const moduleName = state.currentModule || state.completedModules[state.completedModules.length - 1] || ""
  const commitMessage = `feat(${moduleName}): implement ${moduleName}`
  await gitManager.commit(commitMessage)
  const newCompleted = [...(state.completedModules || []), moduleName]
  const newPending = (state.pendingModules || []).filter((m) => m !== moduleName)
  const nextModule = newPending.length > 0 ? newPending[0] : null
  const updates: Partial<BuildState> = {
    completedModules: newCompleted,
    pendingModules: newPending,
    currentModule: nextModule,
    currentNode: "commit_changes",
    retries: 0,
    reviewRetries: 0,
    testRetries: 0,
  }
  if (newPending.length === 0) {
    updates.status = "completed"
  }
  return updates
}
