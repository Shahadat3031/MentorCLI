import OpenAI from "openai"
import { authManager } from "../auth/index.js"
import { PRDParseSchema, ModuleSchema, ConsultationOutputSchema, ReviewOutputSchema } from "../schemas/index.js"
import { Module, ConsultationOutput, ReviewOutput } from "../types/index.js"

class PlannerAgent {
  private client: OpenAI | null = null

  async getClient(): Promise<OpenAI> {
    if (!this.client) {
      const apiKey = await authManager.getKey("openai")
      if (!apiKey) throw new Error("OpenAI API key not configured. Run `mentor login` first.")
      this.client = new OpenAI({ apiKey })
    }
    return this.client
  }

  async parsePRD(prd: string): Promise<{ title: string; features: string[]; constraints: string[] }> {
    const client = await this.getClient()
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software architect. Parse the following PRD and extract:
- title: project title
- features: list of features as strings
- constraints: list of constraints as strings

Return valid JSON matching { title: string, features: string[], constraints: string[] }`,
        },
        { role: "user", content: prd },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenAI")
    return PRDParseSchema.parse(JSON.parse(content))
  }

  async planModules(prd: string, currentModules: Module[]): Promise<Module[]> {
    const client = await this.getClient()
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software architect. Create an ordered execution plan for building the features.

Given the PRD and current modules, produce a refined list of modules with dependencies.

Return valid JSON: { modules: [{ name: string, dependencies: string[] }] }

Order matters - dependencies must come before dependents.`,
        },
        {
          role: "user",
          content: JSON.stringify({ prd, currentModules }),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenAI")
    const parsed = JSON.parse(content)
    return parsed.modules.map((m: Module) => ModuleSchema.parse(m))
  }

  async consult(
    prd: string,
    currentModule: string,
    question: string
  ): Promise<ConsultationOutput> {
    const client = await this.getClient()
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software architect providing technical consultation.

Given the PRD, current module, and question, answer the question.

Return valid JSON matching:
{ resolved: boolean, confidence: number (0-1), needsHuman: boolean, question: string | null, answer: string | null }

If confidence < 0.7, set needsHuman to true and provide the question for human.`,
        },
        {
          role: "user",
          content: JSON.stringify({ prd, currentModule, question }),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenAI")
    return ConsultationOutputSchema.parse(JSON.parse(content))
  }

  async review(
    prd: string,
    moduleName: string,
    generatedFiles: string[],
    testOutput: string
  ): Promise<ReviewOutput> {
    const client = await this.getClient()
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior code reviewer. Review the module implementation.

Given the PRD, module, generated files, and test output, determine if the implementation is correct.

Return valid JSON matching:
{ passed: boolean, issues: string[], confidence: number (0-1) }`,
        },
        {
          role: "user",
          content: JSON.stringify({ prd, moduleName, generatedFiles, testOutput }),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenAI")
    return ReviewOutputSchema.parse(JSON.parse(content))
  }
}

export const plannerAgent = new PlannerAgent()
