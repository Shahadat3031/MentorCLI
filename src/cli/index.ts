#!/usr/bin/env node
import { Command } from "commander"
import { initCommand } from "../commands/init.js"
import { loginCommand } from "../commands/login.js"
import { whoamiCommand } from "../commands/whoami.js"
import { logoutCommand } from "../commands/logout.js"
import { buildCommand } from "../commands/build.js"
import { statusCommand } from "../commands/status.js"
import { resumeCommand } from "../commands/resume.js"
import { diffCommand } from "../commands/diff.js"
import { commitCommand } from "../commands/commit.js"
import { rollbackCommand } from "../commands/rollback.js"
import { logsCommand } from "../commands/logs.js"

const program = new Command()

program
  .name("mentor")
  .description("A local AI software delivery pipeline")
  .version("0.1.0")

program
  .command("init")
  .description("Initialize .mentor directory structure")
  .action(initCommand)

program
  .command("login")
  .description("Configure AI provider API keys")
  .action(loginCommand)

program
  .command("whoami")
  .description("Show AI provider connection status")
  .action(whoamiCommand)

program
  .command("logout")
  .description("Remove provider credentials")
  .action(logoutCommand)

program
  .command("build")
  .description("Build software from a PRD file")
  .argument("<prd-file>", "Path to PRD markdown file")
  .action(buildCommand)

program
  .command("status")
  .description("Show current build status")
  .action(statusCommand)

program
  .command("resume")
  .description("Resume a paused build")
  .action(resumeCommand)

program
  .command("diff")
  .description("Show uncommitted changes")
  .action(diffCommand)

program
  .command("commit")
  .description("Commit changes with a generated message")
  .action(commitCommand)

program
  .command("rollback")
  .description("Rollback to last commit")
  .action(rollbackCommand)

program
  .command("logs")
  .description("View build logs")
  .action(logsCommand)

program.parse(process.argv)
