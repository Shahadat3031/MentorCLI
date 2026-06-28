import chalk from "chalk"
import inquirer from "inquirer"
import { loadGlobalConfig, saveGlobalConfig } from "../config/index.js"
import { getPlannerInfo } from "../providers/planner/index.js"
import { getExecutorInfo } from "../providers/executor/index.js"
import { getReviewerInfo } from "../providers/reviewer/index.js"

export async function configCommand(): Promise<void> {
  const args = process.argv.slice(process.argv.indexOf("config") + 1)
  if (args[0] === "set" && args[1] && args[2]) {
    const key = args[1]
    const value = args[2]
    const validKeys = ["planner", "executor", "reviewer"]

    if (!validKeys.includes(key)) {
      console.error(chalk.red(`Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`))
      process.exit(1)
    }

    const infoMap = key === "planner" ? getPlannerInfo() : key === "executor" ? getExecutorInfo() : getReviewerInfo()

    if (!infoMap[value]) {
      const valid = Object.keys(infoMap).join(", ")
      console.error(chalk.red(`Invalid ${key}: ${value}. Valid options: ${valid}`))
      process.exit(1)
    }

    const current = await loadGlobalConfig()
    current[key as keyof typeof current] = value as any
    await saveGlobalConfig(current)
    console.log(chalk.green(`\n✓ ${key} set to ${value}`))
    return
  }

  const current = await loadGlobalConfig()

  const plannerInfo = getPlannerInfo()
  const executorInfo = getExecutorInfo()
  const reviewerInfo = getReviewerInfo()

  console.log(chalk.cyan("\nCurrent Configuration:\n"))
  console.log(`  Planner:  ${chalk.green(current.planner)} (${plannerInfo[current.planner]?.description || "unknown"})`)
  console.log(`  Executor: ${chalk.green(current.executor)} (${executorInfo[current.executor]?.description || "unknown"})`)
  console.log(`  Reviewer: ${chalk.green(current.reviewer)} (${reviewerInfo[current.reviewer]?.description || "unknown"})`)

  const { change } = await inquirer.prompt([
    {
      type: "confirm",
      name: "change",
      message: "Change configuration?",
      default: false,
    },
  ])

  if (!change) return

  const { planner } = await inquirer.prompt([
    {
      type: "list",
      name: "planner",
      message: "Select planner provider:",
      choices: Object.entries(plannerInfo).map(([key, info]) => ({
        name: `${info.name} - ${info.description}`,
        value: key,
      })),
    },
  ])

  const { executor } = await inquirer.prompt([
    {
      type: "list",
      name: "executor",
      message: "Select executor provider:",
      choices: Object.entries(executorInfo).map(([key, info]) => ({
        name: `${info.name} - ${info.description}`,
        value: key,
      })),
    },
  ])

  const { reviewer } = await inquirer.prompt([
    {
      type: "list",
      name: "reviewer",
      message: "Select reviewer provider:",
      choices: Object.entries(reviewerInfo).map(([key, info]) => ({
        name: `${info.name} - ${info.description}`,
        value: key,
      })),
    },
  ])

  const newConfig = { planner, executor, reviewer }
  await saveGlobalConfig(newConfig)
  console.log(chalk.green("\n✓ Configuration saved"))
  console.log(chalk.cyan(`  Planner: ${planner} → Executor: ${executor} → Reviewer: ${reviewer}`))
}
