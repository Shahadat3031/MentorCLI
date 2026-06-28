# MentorCLI Memory

## Completed

* Rebuilt entire project with provider-agnostic architecture
* Provider interfaces: PlannerProvider, ExecutorProvider, ReviewerProvider
* Planner implementations: OpenRouter, Groq, Gemini, Ollama, Mock
* Executor implementations: OpenCode (spawns `opencode`), Ollama, Shell, Mock
* Reviewer implementations: OpenRouter, Groq, Ollama, Mock
* Provider registry with dynamic resolution
* Config system at `~/.mentor/config.json`
* Session system at `~/.mentor/sessions/`
* Orchestrator with PRD pipeline (plan → execute → test → review → fix → commit)
* Loop protection (MAX_AGENT_TURNS=6, MAX_FIX_ATTEMPTS=5)
* Git engine (status, diff, commit, rollback)
* Test engine (auto-detects npm/pnpm/yarn/flutter)
* 10 CLI commands: init, login, config, build, status, resume, providers, commit, diff, rollback
* 17 tests across 6 test files
* README with architecture, providers, commands

## Decisions

* Provider-agnostic — no hardcoded OpenAI or Anthropic
* API keys stored in `~/.mentor/.env` (loaded from environment)
* Config stored in `~/.mentor/config.json` (provider selection)
* Sessions stored in `~/.mentor/sessions/` (one JSON file per session)
* OpenCode executor spawns `opencode` CLI via child_process.spawn
* Ollama executor uses REST API at localhost:11434
* Orchestrator handles sequential task execution with retry loops
* All provider implementations are independent and pluggable
* `execSync` used for git and test commands (synchronous, blocking)
* No LangGraph dependency — orchestrator is a simple sequential loop

## Known Issues

* GeminiPlanner may need model version adjustments based on API availability
* OpenCode executor requires `opencode` CLI to be installed and on PATH
* Ollama providers require local Ollama server running
* Session state updated after each task (no per-node persistence)
* Tests that mock fs/promises may have race conditions with module caching

## Last Commit

* `051ff12` - feat(tests): add 38 tests across 7 test files, README, and update MEMORY

## Next Step

* Commit current changes
