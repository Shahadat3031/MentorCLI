# MentorCLI Memory

## Completed

* Feature 1: Project scaffold
  * Directory structure matching `master-prompt.md`
  * `package.json` with all required dependencies
  * `tsconfig.json` with strict mode
  * All dependencies installed
  * `.gitignore` with proper exclusions
  * Git repository initialized

* Feature 2: Zod schemas
  * All required schemas: PRDParse, Module, ReviewOutput, ConsultationOutput, HumanDecision, BuildState, AuthConfig, ExecutorOutput, ProjectConfig
  * Strict validation enforced

* Feature 3: Auth system
  * AuthManager class with load/save/validate operations
  * Config stored at `~/.mentor/auth.json`
  * Live API key validation for both providers
  * Clean separation of concerns

* Feature 4: CLI commands (all 11 commands)
  * `init` - creates .mentor directory structure
  * `login` - prompts for provider + API key, validates, saves
  * `whoami` - shows connection status
  * `logout` - removes provider credentials
  * `build` - reads PRD, runs full workflow pipeline
  * `status` - lists all builds with status
  * `resume` - selects and resumes paused build
  * `diff` - shows uncommitted changes
  * `commit` - interactive commit with message
  * `rollback` - safe rollback with confirmation
  * `logs` - per-channel log viewer

* Feature 5: Workflow engine (LangGraph)
  * 9 nodes: parse_prd, plan_modules, execute_module, consult_planner, ask_human, run_tests, review_module, fix_issues, commit_changes
  * Conditional routing with retry limits
  * State persistence after every node
  * Session resume support

* Feature 6: Agents
  * Planner agent (OpenAI GPT-4o-mini) - PRD parsing, module planning, consultation, review
  * Executor agent (Claude Sonnet 4) - module implementation, fix issues
  * Human escalation with structured question/answer

* Feature 7: Tools
  * Project file scanner (max depth 4, max 25 files, ignores node_modules/build/dist/coverage/.git)
  * Test runner (Flutter: flutter test + analyze; Node: npm test + lint + build)
  * Error parser for test output
  * Safety validators (dangerous command detection, path validation)

* Feature 8: Memory system
  * Decision memory at `.mentor/memory/decisions.json`
  * Load/save/get decision operations

* Feature 9: Logging system
  * Per-build, per-channel logs at `.mentor/logs/{buildId}/`
  * Channels: planner, executor, reviewer, tester, git, human
  * Structured log entries (timestamp, message, input, output, errors)

* Feature 10: Tests (38 tests across 7 files)
  * Schema validation tests
  * Auth manager tests (with mocked APIs)
  * Project detection tests
  * Memory system tests
  * Git operations tests
  * Workflow state tests
  * Safety tools tests

* Feature 11: README
  * Installation, setup, usage, architecture, workflow, retry policy

## In Progress

* Nothing - all features complete

## Pending

* Nothing - all features complete

## Decisions

* Project root is at `/home/storyteller/Development/Polygon/MentorCLI`
* Using ES modules (`"type": "module"` in package.json)
* All source paths reference `.js` extensions for ESM compatibility (compiled from `.ts`)
* Auth config stored at `~/.mentor/auth.json`
* `.mentor/` directory created per-project via `mentor init`
* All commands are thin wrappers; business logic in workflow/agents
* LangGraph `StateGraph` used with `Annotation.Root` for state management
* `as any` type assertions used in graph.ts due to LangGraph's chained generic type inference pattern
* Agents never trusted raw; all AI outputs validated with Zod schemas
* Retry policies enforced at workflow level, not agent level

## Known Issues

* Auth key validation makes real API calls (cannot be tested without valid keys; tests use mocks)
* LangGraph type system uses chained generics; `as any` casts required for non-chained usage
* File scanning only reads first 25 files from src/, lib/, app/ directories (by design)

## Last Commit

* `7c286e0` - feat(core): implement workflow engine, agents, tools, git, memory, logging, and CLI commands

## Next Step

* All features complete. Project is ready for use.
