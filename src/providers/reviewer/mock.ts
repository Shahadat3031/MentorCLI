import { ReviewerProvider } from "./index.js"
import { ReviewResult } from "../../types/index.js"

export class MockReviewer implements ReviewerProvider {
  readonly name = "mock"

  async review(_taskDescription: string, _code: string, _testOutput: string): Promise<ReviewResult> {
    return {
      passed: true,
      issues: [],
      score: 0.95,
      commitMessage: "feat: implement feature",
    }
  }
}
