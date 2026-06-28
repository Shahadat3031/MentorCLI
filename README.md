# MentorCLI

A local AI software delivery pipeline that converts Product Requirement Documents (PRDs) into working software through a deterministic multi-agent workflow.

## Architecture

```
PRD → Planner (OpenAI) → Executor (Claude) → Tests → Reviewer (OpenAI) → Fix Loop → Git Commit → Next Module
```

## Installation

```bash
npm install -g mentor-cli
```

Or run locally:

```bash
git clone <repo>
cd mentor-cli
npm install
npm run build
```

## Setup

Initialize the project:

```bash
mentor init
```

Configure AI providers:

```bash
mentor login
```

You need API keys for:
- **OpenAI** (Planner agent - PRD parsing, planning, review, consultation)
- **Anthropic Claude** (Executor agent - code implementation)

## Usage

### Login

```bash
mentor login
```

Follow the prompts to enter your OpenAI and/or Anthropic API keys. Keys are validated with a live API test before saving.

### Check connection status

```bash
mentor whoami
```

### Build from PRD

```bash
mentor build prd.md
```

The system will:
1. Parse the PRD
2. Plan modules
3. Execute each module using Claude
4. Run tests
5. Review output
6. Fix failures
7. Commit successful modules
8. Move to next module

### View build status

```bash
mentor status
```

### Resume paused build

```bash
mentor resume
```

### View changes

```bash
mentor diff
```

### Manual commit

```bash
mentor commit
```

### Rollback changes

```bash
mentor rollback
```

### View logs

```bash
mentor logs
```

### Logout

```bash
mentor logout
```

## Supported Project Types

- **Node.js** (detected via `package.json`)
- **Flutter** (detected via `pubspec.yaml`)

## Workflow

The build pipeline uses LangGraph with the following nodes:

1. `parse_prd` - Parse PRD
2. `plan_modules` - Create execution roadmap
3. `execute_module` - Implement module
4. `consult_planner` - Get architectural guidance
5. `ask_human` - Escalate to human
6. `run_tests` - Execute test suite
7. `review_module` - Review implementation
8. `fix_issues` - Fix failures
9. `commit_changes` - Commit successful code

## Retry Policy

| Limit | Value |
|-------|-------|
| Max fix attempts | 5 |
| Max test retries | 3 |
| Max review retries | 3 |
| Max planner escalations | 2 |

## Project Structure

```
mentor-cli/
├── src/
│   ├── cli/          # CLI entry point
│   ├── commands/     # Command implementations
│   ├── workflow/     # LangGraph workflow engine
│   ├── agents/       # AI agents (Planner, Executor)
│   ├── tools/        # Reusable tools
│   ├── git/          # Git operations
│   ├── auth/         # Authentication
│   ├── memory/       # Decision memory
│   ├── logs/         # Logging system
│   ├── schemas/      # Zod validation schemas
│   ├── types/        # TypeScript types
│   ├── config/       # Configuration
│   └── project/      # Project detection
├── tests/            # Test files
└── docs/             # Documentation
```
