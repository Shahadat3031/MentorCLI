import { Annotation } from "@langchain/langgraph"
import { BuildState, Module, ReviewOutput, ConsultationOutput, HumanDecision, ProjectType, BuildStatus } from "../types/index.js"

export const BuildStateAnnotation = Annotation.Root({
  buildId: Annotation<string>(),
  prd: Annotation<string>(),
  projectType: Annotation<ProjectType>(),
  modules: Annotation<Module[]>(),
  currentModule: Annotation<string | null>(),
  currentNode: Annotation<string>(),
  completedModules: Annotation<string[]>(),
  pendingModules: Annotation<string[]>(),
  generatedFiles: Annotation<string[]>(),
  testOutput: Annotation<string>(),
  reviewOutput: Annotation<ReviewOutput | null>(),
  consultationOutput: Annotation<ConsultationOutput | null>(),
  humanDecision: Annotation<HumanDecision | null>(),
  retries: Annotation<number>(),
  reviewRetries: Annotation<number>(),
  testRetries: Annotation<number>(),
  status: Annotation<BuildStatus>(),
})

export function createInitialState(buildId: string, prd: string, projectType: ProjectType): BuildState {
  return {
    buildId,
    prd,
    projectType,
    modules: [],
    currentModule: null,
    currentNode: "",
    completedModules: [],
    pendingModules: [],
    generatedFiles: [],
    testOutput: "",
    reviewOutput: null,
    consultationOutput: null,
    humanDecision: null,
    retries: 0,
    reviewRetries: 0,
    testRetries: 0,
    status: "running",
  }
}
