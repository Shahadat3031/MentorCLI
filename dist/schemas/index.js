import { z } from "zod";
export const PRDParseSchema = z.object({
    title: z.string(),
    features: z.array(z.string()),
    constraints: z.array(z.string()),
});
export const ModuleSchema = z.object({
    name: z.string(),
    dependencies: z.array(z.string()),
});
export const ReviewOutputSchema = z.object({
    passed: z.boolean(),
    issues: z.array(z.string()),
    confidence: z.number(),
});
export const ConsultationOutputSchema = z.object({
    resolved: z.boolean(),
    confidence: z.number(),
    needsHuman: z.boolean(),
    question: z.string().nullable(),
    answer: z.string().nullable(),
});
export const HumanDecisionSchema = z.object({
    question: z.string(),
    answer: z.string(),
});
export const BuildStateSchema = z.object({
    buildId: z.string(),
    prd: z.string(),
    projectType: z.enum(["flutter", "node"]),
    modules: z.array(ModuleSchema),
    currentModule: z.string().nullable(),
    currentNode: z.string(),
    completedModules: z.array(z.string()),
    pendingModules: z.array(z.string()),
    generatedFiles: z.array(z.string()),
    testOutput: z.string(),
    reviewOutput: ReviewOutputSchema.nullable(),
    consultationOutput: ConsultationOutputSchema.nullable(),
    humanDecision: HumanDecisionSchema.nullable(),
    retries: z.number(),
    reviewRetries: z.number(),
    testRetries: z.number(),
    status: z.enum(["running", "paused", "failed", "completed"]),
});
export const AuthConfigSchema = z.object({
    openai: z.object({ apiKey: z.string() }).optional(),
    anthropic: z.object({ apiKey: z.string() }).optional(),
});
export const ExecutorOutputSchema = z.object({
    changedFiles: z.array(z.string()),
    summary: z.string(),
    confidence: z.number(),
    needsConsultation: z.boolean(),
    question: z.string().nullable(),
});
export const ProjectConfigSchema = z.object({
    projectType: z.enum(["flutter", "node"]),
});
//# sourceMappingURL=index.js.map