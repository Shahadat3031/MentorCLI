import { z } from "zod";
export declare const PRDParseSchema: z.ZodObject<{
    title: z.ZodString;
    features: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    features: string[];
    constraints: string[];
}, {
    title: string;
    features: string[];
    constraints: string[];
}>;
export declare const ModuleSchema: z.ZodObject<{
    name: z.ZodString;
    dependencies: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    dependencies: string[];
}, {
    name: string;
    dependencies: string[];
}>;
export declare const ReviewOutputSchema: z.ZodObject<{
    passed: z.ZodBoolean;
    issues: z.ZodArray<z.ZodString, "many">;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    issues: string[];
    passed: boolean;
    confidence: number;
}, {
    issues: string[];
    passed: boolean;
    confidence: number;
}>;
export declare const ConsultationOutputSchema: z.ZodObject<{
    resolved: z.ZodBoolean;
    confidence: z.ZodNumber;
    needsHuman: z.ZodBoolean;
    question: z.ZodNullable<z.ZodString>;
    answer: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    resolved: boolean;
    needsHuman: boolean;
    question: string | null;
    answer: string | null;
}, {
    confidence: number;
    resolved: boolean;
    needsHuman: boolean;
    question: string | null;
    answer: string | null;
}>;
export declare const HumanDecisionSchema: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    question: string;
    answer: string;
}, {
    question: string;
    answer: string;
}>;
export declare const BuildStateSchema: z.ZodObject<{
    buildId: z.ZodString;
    prd: z.ZodString;
    projectType: z.ZodEnum<["flutter", "node"]>;
    modules: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dependencies: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dependencies: string[];
    }, {
        name: string;
        dependencies: string[];
    }>, "many">;
    currentModule: z.ZodNullable<z.ZodString>;
    currentNode: z.ZodString;
    completedModules: z.ZodArray<z.ZodString, "many">;
    pendingModules: z.ZodArray<z.ZodString, "many">;
    generatedFiles: z.ZodArray<z.ZodString, "many">;
    testOutput: z.ZodString;
    reviewOutput: z.ZodNullable<z.ZodObject<{
        passed: z.ZodBoolean;
        issues: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        issues: string[];
        passed: boolean;
        confidence: number;
    }, {
        issues: string[];
        passed: boolean;
        confidence: number;
    }>>;
    consultationOutput: z.ZodNullable<z.ZodObject<{
        resolved: z.ZodBoolean;
        confidence: z.ZodNumber;
        needsHuman: z.ZodBoolean;
        question: z.ZodNullable<z.ZodString>;
        answer: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        resolved: boolean;
        needsHuman: boolean;
        question: string | null;
        answer: string | null;
    }, {
        confidence: number;
        resolved: boolean;
        needsHuman: boolean;
        question: string | null;
        answer: string | null;
    }>>;
    humanDecision: z.ZodNullable<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        question: string;
        answer: string;
    }, {
        question: string;
        answer: string;
    }>>;
    retries: z.ZodNumber;
    reviewRetries: z.ZodNumber;
    testRetries: z.ZodNumber;
    status: z.ZodEnum<["running", "paused", "failed", "completed"]>;
}, "strip", z.ZodTypeAny, {
    status: "running" | "paused" | "failed" | "completed";
    buildId: string;
    prd: string;
    projectType: "flutter" | "node";
    modules: {
        name: string;
        dependencies: string[];
    }[];
    currentModule: string | null;
    currentNode: string;
    completedModules: string[];
    pendingModules: string[];
    generatedFiles: string[];
    testOutput: string;
    reviewOutput: {
        issues: string[];
        passed: boolean;
        confidence: number;
    } | null;
    consultationOutput: {
        confidence: number;
        resolved: boolean;
        needsHuman: boolean;
        question: string | null;
        answer: string | null;
    } | null;
    humanDecision: {
        question: string;
        answer: string;
    } | null;
    retries: number;
    reviewRetries: number;
    testRetries: number;
}, {
    status: "running" | "paused" | "failed" | "completed";
    buildId: string;
    prd: string;
    projectType: "flutter" | "node";
    modules: {
        name: string;
        dependencies: string[];
    }[];
    currentModule: string | null;
    currentNode: string;
    completedModules: string[];
    pendingModules: string[];
    generatedFiles: string[];
    testOutput: string;
    reviewOutput: {
        issues: string[];
        passed: boolean;
        confidence: number;
    } | null;
    consultationOutput: {
        confidence: number;
        resolved: boolean;
        needsHuman: boolean;
        question: string | null;
        answer: string | null;
    } | null;
    humanDecision: {
        question: string;
        answer: string;
    } | null;
    retries: number;
    reviewRetries: number;
    testRetries: number;
}>;
export declare const AuthConfigSchema: z.ZodObject<{
    openai: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
    }, {
        apiKey: string;
    }>>;
    anthropic: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
    }, {
        apiKey: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    openai?: {
        apiKey: string;
    } | undefined;
    anthropic?: {
        apiKey: string;
    } | undefined;
}, {
    openai?: {
        apiKey: string;
    } | undefined;
    anthropic?: {
        apiKey: string;
    } | undefined;
}>;
export declare const ExecutorOutputSchema: z.ZodObject<{
    changedFiles: z.ZodArray<z.ZodString, "many">;
    summary: z.ZodString;
    confidence: z.ZodNumber;
    needsConsultation: z.ZodBoolean;
    question: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    question: string | null;
    changedFiles: string[];
    summary: string;
    needsConsultation: boolean;
}, {
    confidence: number;
    question: string | null;
    changedFiles: string[];
    summary: string;
    needsConsultation: boolean;
}>;
export declare const ProjectConfigSchema: z.ZodObject<{
    projectType: z.ZodEnum<["flutter", "node"]>;
}, "strip", z.ZodTypeAny, {
    projectType: "flutter" | "node";
}, {
    projectType: "flutter" | "node";
}>;
//# sourceMappingURL=index.d.ts.map