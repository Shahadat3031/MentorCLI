import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph"
import { BuildStateAnnotation } from "./state.js"
import {
  parsePrdNode,
  planModulesNode,
  executeModuleNode,
  consultPlannerNode,
  askHumanNode,
  runTestsNode,
  reviewModuleNode,
  fixIssuesNode,
  commitChangesNode,
} from "./nodes.js"
import { RETRY_POLICY } from "../config/index.js"
import { BuildState } from "../types/index.js"

function routeAfterExecute(state: BuildState): string[] {
  if (state.consultationOutput?.question) {
    return ["consult_planner"]
  }
  return ["run_tests"]
}

function routeAfterConsult(state: BuildState): string[] {
  if (
    state.consultationOutput?.confidence !== undefined &&
    state.consultationOutput.confidence < 0.7 &&
    !state.consultationOutput.needsHuman
  ) {
    return ["ask_human"]
  }
  if (state.consultationOutput?.needsHuman) {
    return ["ask_human"]
  }
  return ["execute_module"]
}

function routeAfterHuman(state: BuildState): string[] {
  return ["execute_module"]
}

function routeAfterTests(state: BuildState): string[] {
  if (state.testRetries >= RETRY_POLICY.MAX_TEST_RETRIES) {
    return [END]
  }
  const passed =
    !state.testOutput.includes("FAIL") &&
    !state.testOutput.includes("failed") &&
    state.testOutput.length > 0
  if (passed) {
    return ["review_module"]
  }
  if (state.retries >= RETRY_POLICY.MAX_FIX_ATTEMPTS) {
    return [END]
  }
  return ["fix_issues"]
}

function routeAfterReview(state: BuildState): string[] {
  if (state.reviewRetries >= RETRY_POLICY.MAX_REVIEW_RETRIES) {
    return [END]
  }
  if (state.reviewOutput?.passed) {
    return ["commit_changes"]
  }
  if (state.retries >= RETRY_POLICY.MAX_FIX_ATTEMPTS) {
    return [END]
  }
  return ["fix_issues"]
}

function routeAfterFix(state: BuildState): string[] {
  if (state.status === "paused") {
    return [END]
  }
  return ["run_tests"]
}

function routeAfterCommit(state: BuildState): string[] {
  if (state.status === "completed") {
    return [END]
  }
  if (state.currentModule) {
    return ["execute_module"]
  }
  return [END]
}

export function buildWorkflowGraph() {
  const workflow: any = new StateGraph(BuildStateAnnotation)

  workflow.addNode("parse_prd", parsePrdNode)
  workflow.addNode("plan_modules", planModulesNode)
  workflow.addNode("execute_module", executeModuleNode)
  workflow.addNode("consult_planner", consultPlannerNode)
  workflow.addNode("ask_human", askHumanNode)
  workflow.addNode("run_tests", runTestsNode)
  workflow.addNode("review_module", reviewModuleNode)
  workflow.addNode("fix_issues", fixIssuesNode)
  workflow.addNode("commit_changes", commitChangesNode)

  workflow.addEdge(START, "parse_prd")
  workflow.addEdge("parse_prd", "plan_modules")
  workflow.addEdge("plan_modules", "execute_module")

  workflow.addConditionalEdges("execute_module", routeAfterExecute)
  workflow.addConditionalEdges("consult_planner", routeAfterConsult)
  workflow.addConditionalEdges("ask_human", routeAfterHuman)
  workflow.addConditionalEdges("run_tests", routeAfterTests)
  workflow.addConditionalEdges("review_module", routeAfterReview)
  workflow.addConditionalEdges("fix_issues", routeAfterFix)
  workflow.addConditionalEdges("commit_changes", routeAfterCommit)

  return workflow.compile({ checkpointer: new MemorySaver() })
}
