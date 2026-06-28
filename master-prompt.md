Build a production-grade TypeScript CLI application called **MentorCLI**.

This is NOT a chatbot.

This is a **local AI software delivery pipeline**.

Its purpose is:

Convert a Product Requirement Document (PRD) into working software through a deterministic multi-agent workflow.

Core pipeline:

PRD
→ Planner (ChatGPT)
→ Executor (Claude)
→ Test Runner
→ Reviewer (ChatGPT)
→ Fix Loop
→ Git Commit
→ Next Module

Critical escalation chain:

Claude → ChatGPT → Human

Authority order:

Human > ChatGPT > Claude

This hierarchy MUST be enforced.

---

PRIMARY GOAL

Given:

mentor build prd.md

The system must:

1. Parse PRD
2. Create execution roadmap
3. Build module-by-module
4. Run tests
5. Review output
6. Fix failures
7. Escalate ambiguity
8. Commit successful code
9. Save workflow state
10. Resume after interruption

---

TECH STACK (mandatory)

Runtime:

* Node.js
* TypeScript

CLI:

* commander
* inquirer
* chalk
* ora

AI:

* openai
* @anthropic-ai/sdk

Workflow:

* LangGraph

Validation:

* zod

Git:

* simple-git

Config:

* dotenv

System:

* child_process
* fs/promises
* path

Testing:

* vitest

Do NOT replace these.

---

PROJECT STRUCTURE (mandatory)

mentor-cli/
├── src/
│   ├── cli/
│   ├── commands/
│   ├── workflow/
│   ├── agents/
│   ├── tools/
│   ├── git/
│   ├── auth/
│   ├── memory/
│   ├── logs/
│   ├── schemas/
│   ├── types/
│   ├── config/
│   ├── project/
│   └── utils/
├── tests/
├── templates/
├── docs/
├── package.json
├── tsconfig.json
└── README.md

Follow exactly.

---

CLI COMMANDS (required)

mentor init
mentor login
mentor whoami
mentor logout
mentor build <prd-file>
mentor status
mentor resume
mentor diff
mentor commit
mentor rollback
mentor logs

Implement in this order.

---

COMMAND REQUIREMENTS

1. mentor init

Creates:

.mentor/
sessions/
logs/
memory/
state.json
project.json

Must be idempotent.

---

2. mentor login

Supports:

* OpenAI
* Claude
* Both

Flow:

Prompt user:
Choose provider.

Ask API key.

Validate key using live API test.

Store in:

~/.mentor/auth.json

Schema:

{
"openai": {
"apiKey": "string"
},
"anthropic": {
"apiKey": "string"
}
}

Never store invalid keys.

---

3. mentor whoami

Show:

OpenAI: connected/disconnected
Claude: connected/disconnected

---

4. mentor logout

Remove provider credentials safely.

---

5. mentor build <prd-file>

MAIN COMMAND.

Reads PRD.

Starts workflow.

Must create:

buildId

Example:

build_20260628_001

Store state:

.mentor/sessions/{buildId}.json

---

WORKFLOW ENGINE (mandatory)

Use LangGraph.

State schema:

type BuildState = {
buildId: string
prd: string
projectType: "flutter" | "node"
modules: Module[]
currentModule: string | null
currentNode: string
completedModules: string[]
pendingModules: string[]
generatedFiles: string[]
testOutput: string
reviewOutput: ReviewOutput | null
consultationOutput: ConsultationOutput | null
humanDecision: HumanDecision | null
retries: number
reviewRetries: number
testRetries: number
status: "running" | "paused" | "failed" | "completed"
}

Save state after EVERY node.

Mandatory.

---

WORKFLOW NODES (exact)

1. parse_prd
2. plan_modules
3. execute_module
4. consult_planner
5. ask_human
6. run_tests
7. review_module
8. fix_issues
9. commit_changes

Do not invent extra nodes.

---

WORKFLOW GRAPH

parse_prd
→ plan_modules
→ execute_module
→ run_tests
→ review_module

Conditional:

If executor needs help:
execute_module → consult_planner

If planner confidence < 0.7:
consult_planner → ask_human

If tests fail:
run_tests → fix_issues

If review fails:
review_module → fix_issues

If fix complete:
fix_issues → run_tests

If review passes:
review_module → commit_changes

After commit:
move to next module

Repeat.

---

RETRY POLICY (strict)

MAX_FIX_ATTEMPTS = 5
MAX_TEST_RETRIES = 3
MAX_REVIEW_RETRIES = 3
MAX_PLANNER_ESCALATIONS = 2

Rules:

If exceeded:

pause workflow

require human intervention

Never infinite loop.

---

PROJECT DETECTION (mandatory)

Detect project root.

Rules:

If pubspec.yaml exists:
projectType = flutter

If package.json exists:
projectType = node

Save:

.mentor/project.json

Schema:

{
"projectType": "flutter" | "node"
}

Fail if unsupported.

---

PROJECT SCANNING RULES

Scan only:

src/
lib/
app/

Max depth: 4

Ignore:

node_modules
build
dist
coverage
.git

Max files loaded into AI context: 25

This prevents context explosion.

Mandatory.

---

AGENT DEFINITIONS

1. Planner Agent (OpenAI)

Responsibilities:

* parse PRD
* build roadmap
* answer technical consultation
* review implementation

Rules:

* never generate implementation code
* must return structured output only

---

2. Executor Agent (Claude)

Responsibilities:

* implement module
* modify files
* fix issues

Rules:

* modify only project files
* no git operations
* no deleting files without approval

Must return:

changed files
summary
confidence score

Schema:

{
"changedFiles": string[]
"summary": string
"confidence": number
"needsConsultation": boolean
"question": string | null
}

Confidence must be between 0.0 and 1.0.

Mandatory.

---

3. Human

Responsibilities:

* resolve business ambiguity
* approve destructive changes
* answer missing product logic

Highest authority.

---

SCHEMAS (strict with zod)

Create exact schemas:

PRDParseSchema

{
"title": string
"features": string[]
"constraints": string[]
}

ModuleSchema

{
"name": string
"dependencies": string[]
}

ReviewOutputSchema

{
"passed": boolean
"issues": string[]
"confidence": number
}

ConsultationOutputSchema

{
"resolved": boolean
"confidence": number
"needsHuman": boolean
"question": string | null
"answer": string | null
}

HumanDecisionSchema

{
"question": string
"answer": string
}

Never accept invalid structure.

Mandatory.

---

TEST ENGINE

For Flutter:

Run:

flutter test
flutter analyze

For Node:

Run:

npm test
npm run lint
npm run build

Capture:

stdout
stderr
exitCode

Store in BuildState.

Parse errors into:

{
"type": string
"file": string
"message": string
}

Structured only.

---

GIT TOOLING

Implement:

status()
diff()
commit()
rollback()

Rules:

Never commit if:

* tests fail
* review fails

Commit style:

Conventional commits.

Example:

feat(auth): implement login flow

Commit message generated by Planner.

---

MEMORY SYSTEM

Two layers:

1. Session Memory

Store:

current workflow state

Path:

.mentor/sessions/

---

2. Decision Memory

Store:

business decisions
architecture decisions

Path:

.mentor/memory/decisions.json

Example:

{
"invoice_editing": "disabled after approval"
}

Must be injected into future consultations.

Mandatory.

---

LOGGING SYSTEM

Store:

.mentor/logs/{buildId}/

Required logs:

planner.log
executor.log
reviewer.log
tester.log
git.log
human.log

Each must contain:

timestamp
input
output
errors

Mandatory.

---

SAFETY RULES (strict)

Block dangerous commands:

rm
sudo
chmod
mkfs

Never allow execution.

---

Never modify outside project root.

Enforce absolute path validation.

---

Require approval before:

* deleting files
* changing .env
* changing package.json
* changing pubspec.yaml
* mass file changes (>10 files)

Mandatory.

---

TERMINAL UI

Use colors:

Planner → blue
Executor → green
Tester → yellow
Reviewer → magenta
Git → cyan
Human → red

Show:

Current module
Current node
Retries
Status

Progress UI:

✓ Auth
● Dashboard
○ Payments

Mandatory.

---

TESTS (required)

Write tests for:

* auth manager
* workflow transitions
* retry policies
* project detection
* state persistence
* session resume
* git tools
* schema validation

Use Vitest.

---

README (required)

Must include:

installation
setup
login
build
resume
status
rollback
logs

Usage examples:

mentor init
mentor login
mentor build prd.md
mentor status
mentor resume

---

IMPLEMENTATION RULES (strict)

1. Commands must be thin.
2. Workflow owns business logic.
3. Agents must be isolated.
4. Tools must be reusable.
5. State must persist after every node.
6. Every AI response must pass zod validation.
7. Never trust raw AI output.
8. Never auto-fix endlessly.
9. Never auto-commit failing code.
10. Prefer deterministic behavior over flexible behavior.

Start implementation now.

Build in exact order:

1. project scaffold
2. schemas
3. auth
4. CLI commands
5. workflow engine
6. agents
7. tools
8. memory
9. logging
10. tests
11. README

No placeholders.
No TODOs.
No pseudo-code.

Everything must be runnable.

