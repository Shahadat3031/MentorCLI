import chalk from "chalk"
import { getPlannerInfo } from "../providers/planner/index.js"
import { getExecutorInfo } from "../providers/executor/index.js"
import { getReviewerInfo } from "../providers/reviewer/index.js"

export async function providersCommand(): Promise<void> {
  const planners = getPlannerInfo()
  const executors = getExecutorInfo()
  const reviewers = getReviewerInfo()

  console.log(chalk.cyan("\nAvailable Providers:\n"))

  console.log(chalk.blue("Planners:"))
  for (const [key, info] of Object.entries(planners)) {
    console.log(`  ${chalk.green(key)} - ${info.description}`)
  }

  console.log(chalk.green("\nExecutors:"))
  for (const [key, info] of Object.entries(executors)) {
    console.log(`  ${chalk.green(key)} - ${info.description}`)
  }

  console.log(chalk.magenta("\nReviewers:"))
  for (const [key, info] of Object.entries(reviewers)) {
    console.log(`  ${chalk.green(key)} - ${info.description}`)
  }

  console.log("")
}
