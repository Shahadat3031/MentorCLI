export type ProjectType = "flutter" | "node"

export type BuildStatus = "running" | "paused" | "failed" | "completed"

export type Provider = "openai" | "anthropic"

export interface AuthCredentials {
  apiKey: string
}

export interface AuthConfig {
  openai?: AuthCredentials
  anthropic?: AuthCredentials
}

export interface Module {
  name: string
  dependencies: string[]
}

export interface ReviewOutput {
  passed: boolean
  issues: string[]
  confidence: number
}

export interface ConsultationOutput {
  resolved: boolean
  confidence: number
  needsHuman: boolean
  question: string | null
  answer: string | null
}

export interface HumanDecision {
  question: string
  answer: string
}

export interface BuildState {
  buildId: string
  prd: string
  projectType: ProjectType
  modules: Module[]
  currentModule: string | null
  currentNode: string
  completedModules: string[]
  pendingModules: string[]
  generatedFiles: string[]
  testOutput: string
  reviewOutput: ReviewOutput | null
  consultationOutput: ConsultationOutput | null
  humanDecision: HumanDecision | null
  retries: number
  reviewRetries: number
  testRetries: number
  status: BuildStatus
}

export interface ProjectConfig {
  projectType: ProjectType
}

export interface ExecutorOutput {
  changedFiles: string[]
  summary: string
  confidence: number
  needsConsultation: boolean
  question: string | null
}

export interface ParsedError {
  type: string
  file: string
  message: string
}
