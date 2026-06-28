# MentorCLI

A provider-agnostic autonomous software building system.

Turn a PRD into working software through planning, execution, review, testing, fixing, and git commits.

## Architecture

```
PRD → Planner → Executor → Reviewer → Test Engine → Fix Loop → Git Commit
```

All providers are pluggable. No hardcoded AI vendors.

## Installation

```bash
npm install -g mentor-cli
```

Or from source:

```bash
git clone <repo>
cd mentor-cli
npm install
npm run build
npm link
```

## Quick Start

```bash
mentor init                  # Initialize config
mentor config                # Choose providers (default: mock)
mentor login                 # Set API keys
mentor build prd.md          # Build from PRD
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `mentor init` | Initialize ~/.mentor directory |
| `mentor login` | Set API keys for providers |
| `mentor config` | Configure active providers |
| `mentor build <prd-file>` | Build software from PRD |
| `mentor status` | Show session status |
| `mentor resume` | Resume a paused session |
| `mentor providers` | List available providers |
| `mentor commit` | Commit changes |
| `mentor diff` | Show uncommitted changes |
| `mentor rollback` | Rollback uncommitted changes |

## Providers

### Planners
- **openrouter** - OpenRouter AI (any model)
- **groq** - Groq cloud inference
- **gemini** - Google Gemini
- **ollama** - Local Ollama models
- **mock** - Mock for testing

### Executors
- **opencode** - OpenCode AI coding agent (spawns `opencode`)
- **ollama** - Local models (qwen2.5-coder, deepseek-coder, codellama)
- **shell** - Shell command executor
- **mock** - Mock for testing

### Reviewers
- **openrouter** - OpenRouter AI
- **groq** - Groq cloud inference
- **ollama** - Local Ollama models
- **mock** - Mock for testing

## Configuration

Global config at `~/.mentor/config.json`:

```json
{
  "planner": "openrouter",
  "executor": "opencode",
  "reviewer": "groq"
}
```

API keys stored in `~/.mentor/.env`.

## Session System

Build sessions are stored at `~/.mentor/sessions/`. Each session tracks:
- PRD content
- Task list
- Progress (completed/failed tasks)
- Agent turns and fix attempts
- Status (running/paused/completed/failed)

## Loop Protection

- MAX_AGENT_TURNS = 6
- MAX_FIX_ATTEMPTS = 5

Prevents infinite loops during execution.

## Test Engine

Auto-detects project type and package manager:
- Node.js: npm / pnpm / yarn (runs `{pm} test`)
- Flutter: (runs `flutter test`)

## Project Structure

```
src/
├── cli/               # CLI entry point
├── commands/          # Command implementations
├── providers/         # Provider interfaces + implementations
│   ├── planner/       # Planner providers
│   ├── executor/      # Executor providers
│   └── reviewer/      # Reviewer providers
├── orchestrator/      # Build orchestrator
├── git/               # Git operations
├── tests/             # Test engine
├── sessions/          # Session management
├── config/            # Configuration
└── types/             # TypeScript types
```
