#!/usr/bin/env node
import dotenv from "dotenv"
import path from "path"
import os from "os"
import { Command } from "commander"

dotenv.config({ path: path.join(os.homedir(), ".mentor", ".env") })
import { initCommand } from "../commands/init.js"
import { loginCommand } from "../commands/login.js"
import { configCommand } from "../commands/config.js"
import { buildCommand } from "../commands/build.js"
import { statusCommand } from "../commands/status.js"
import { resumeCommand } from "../commands/resume.js"
import { providersCommand } from "../commands/providers.js"
import { commitCommand } from "../commands/commit.js"
import { diffCommand } from "../commands/diff.js"
import { rollbackCommand } from "../commands/rollback.js"

const program = new Command()

program
  .name("mentor")
  .description("Provider-agnostic autonomous software building system")
  .version("0.1.0")

program.command("init").description("Initialize ~/.mentor directory and config").action(initCommand)

program.command("login").description("Set API keys for providers").action(loginCommand)

program.command("config").description("Configure active providers (planner/executor/reviewer)").action(configCommand)

program
  .command("build")
  .description("Build software from a PRD file")
  .argument("<prd-file>", "Path to PRD markdown file")
  .action(buildCommand)

program.command("status").description("Show session status").action(statusCommand)

program.command("resume").description("Resume a paused session").action(resumeCommand)

program.command("providers").description("List available providers").action(providersCommand)

program.command("commit").description("Commit changes").action(commitCommand)

program.command("diff").description("Show uncommitted changes").action(diffCommand)

program.command("rollback").description("Rollback uncommitted changes").action(rollbackCommand)

program.parse(process.argv)
