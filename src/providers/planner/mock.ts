import { PlannerProvider } from "./index.js"
import { Task } from "../../types/index.js"

export class MockPlanner implements PlannerProvider {
  readonly name = "mock"

  async plan(_prd: string, _projectType: string): Promise<Task[]> {
    return [
      {
        name: "auth",
        description: "Implement authentication module",
        dependencies: [],
      },
      {
        name: "dashboard",
        description: "Implement dashboard page",
        dependencies: ["auth"],
      },
    ]
  }
}
