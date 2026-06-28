export type ProjectType = "node" | "flutter"

export type BuildStatus = "running" | "paused" | "failed" | "completed"

export interface Task {
  name: string
  description: string
  dependencies: string[]
}

export interface ExecutionResult {
  changedFiles: string[]
  summary: string
  code?: string
}

export interface ReviewResult {
  passed: boolean
  issues: string[]
  score: number
  commitMessage?: string
}

export interface TestResult {
  passed: boolean
  output: string
  exitCode: number
}

export interface SessionState {
  sessionId: string
  prd: string
  tasks: Task[]
  currentTask: number
  projectType: ProjectType
  status: BuildStatus
  agentTurns: number
  fixAttempts: number
  completedTasks: string[]
  failedTasks: string[]
  summary: string
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface MentorConfig {
  planner: string
  executor: string
  reviewer: string
}

export interface ProviderInfo {
  name: string
  description: string
}
