import { describe, it, expect } from "vitest"
import {
  PRDParseSchema,
  ModuleSchema,
  ReviewOutputSchema,
  ConsultationOutputSchema,
  HumanDecisionSchema,
  BuildStateSchema,
  AuthConfigSchema,
  ExecutorOutputSchema,
  ProjectConfigSchema,
} from "../src/schemas/index.js"

describe("PRDParseSchema", () => {
  it("accepts valid PRD parse output", () => {
    const result = PRDParseSchema.parse({
      title: "Test Project",
      features: ["auth", "dashboard"],
      constraints: ["no external deps"],
    })
    expect(result.title).toBe("Test Project")
    expect(result.features).toHaveLength(2)
  })

  it("rejects missing fields", () => {
    expect(() => PRDParseSchema.parse({ title: "Test" })).toThrow()
  })

  it("rejects wrong types", () => {
    expect(() =>
      PRDParseSchema.parse({ title: "Test", features: "not array", constraints: [] })
    ).toThrow()
  })
})

describe("ModuleSchema", () => {
  it("accepts valid module", () => {
    const result = ModuleSchema.parse({ name: "auth", dependencies: ["core"] })
    expect(result.name).toBe("auth")
  })

  it("accepts module with no dependencies", () => {
    const result = ModuleSchema.parse({ name: "core", dependencies: [] })
    expect(result.dependencies).toEqual([])
  })
})

describe("ReviewOutputSchema", () => {
  it("accepts passing review", () => {
    const result = ReviewOutputSchema.parse({
      passed: true,
      issues: [],
      confidence: 0.95,
    })
    expect(result.passed).toBe(true)
  })

  it("accepts failing review with issues", () => {
    const result = ReviewOutputSchema.parse({
      passed: false,
      issues: ["missing error handling"],
      confidence: 0.4,
    })
    expect(result.passed).toBe(false)
  })
})

describe("ConsultationOutputSchema", () => {
  it("accepts resolved consultation", () => {
    const result = ConsultationOutputSchema.parse({
      resolved: true,
      confidence: 0.9,
      needsHuman: false,
      question: null,
      answer: "Use dependency injection",
    })
    expect(result.resolved).toBe(true)
  })

  it("accepts unresolved consultation needing human", () => {
    const result = ConsultationOutputSchema.parse({
      resolved: false,
      confidence: 0.5,
      needsHuman: true,
      question: "Should we use MySQL or PostgreSQL?",
      answer: null,
    })
    expect(result.needsHuman).toBe(true)
  })
})

describe("HumanDecisionSchema", () => {
  it("stores human decision", () => {
    const result = HumanDecisionSchema.parse({
      question: "Which DB?",
      answer: "PostgreSQL",
    })
    expect(result.answer).toBe("PostgreSQL")
  })
})

describe("BuildStateSchema", () => {
  it("validates complete build state", () => {
    const state = {
      buildId: "build_20260628_001",
      prd: "# PRD content",
      projectType: "node" as const,
      modules: [{ name: "auth", dependencies: [] }],
      currentModule: "auth",
      currentNode: "execute_module",
      completedModules: [],
      pendingModules: ["auth"],
      generatedFiles: ["src/auth.ts"],
      testOutput: "PASS",
      reviewOutput: null,
      consultationOutput: null,
      humanDecision: null,
      retries: 0,
      reviewRetries: 0,
      testRetries: 0,
      status: "running" as const,
    }
    const result = BuildStateSchema.parse(state)
    expect(result.buildId).toBe("build_20260628_001")
    expect(result.status).toBe("running")
  })

  it("rejects invalid status", () => {
    const state = {
      buildId: "test",
      prd: "prd",
      projectType: "node",
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
      status: "invalid_status",
    }
    expect(() => BuildStateSchema.parse(state)).toThrow()
  })
})

describe("AuthConfigSchema", () => {
  it("accepts full auth config", () => {
    const result = AuthConfigSchema.parse({
      openai: { apiKey: "sk-..." },
      anthropic: { apiKey: "sk-ant-..." },
    })
    expect(result.openai?.apiKey).toBe("sk-...")
  })

  it("accepts partial auth config", () => {
    const result = AuthConfigSchema.parse({
      openai: { apiKey: "sk-..." },
    })
    expect(result.anthropic).toBeUndefined()
  })
})

describe("ExecutorOutputSchema", () => {
  it("validates executor output", () => {
    const result = ExecutorOutputSchema.parse({
      changedFiles: ["src/auth.ts"],
      summary: "Implemented auth module",
      confidence: 0.85,
      needsConsultation: false,
      question: null,
    })
    expect(result.confidence).toBe(0.85)
  })
})

describe("ProjectConfigSchema", () => {
  it("accepts node type", () => {
    const result = ProjectConfigSchema.parse({ projectType: "node" })
    expect(result.projectType).toBe("node")
  })

  it("accepts flutter type", () => {
    const result = ProjectConfigSchema.parse({ projectType: "flutter" })
    expect(result.projectType).toBe("flutter")
  })
})
