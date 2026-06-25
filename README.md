# AI Agent Skills

Portable, installable skills for AI coding agents such as Codex and Claude.

[![npm version](https://img.shields.io/npm/v/@anuragsarkar97/ai-agent-skills.svg)](https://www.npmjs.com/package/@anuragsarkar97/ai-agent-skills)
[![npm downloads](https://img.shields.io/npm/dm/@anuragsarkar97/ai-agent-skills.svg)](https://www.npmjs.com/package/@anuragsarkar97/ai-agent-skills)
[![license](https://img.shields.io/npm/l/@anuragsarkar97/ai-agent-skills.svg)](https://www.npmjs.com/package/@anuragsarkar97/ai-agent-skills)

| npm package | Install |
|---|---|
| [`@anuragsarkar97/ai-agent-skills`](https://www.npmjs.com/package/@anuragsarkar97/ai-agent-skills) | `npx -y @anuragsarkar97/ai-agent-skills@latest install --agent codex --write --force` |

This repository gives agents reusable operating modes for review, planning, implementation, testing, product thinking, communication, reliability, observability, and stack-specific engineering judgment. Skills are intentionally small. Deeper guidance lives in curated knowledge packs that agents load only when needed.

## Install

Install everything into Codex:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest install --agent codex --write --force
```

Install everything into Claude:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest install --agent claude --write --force
```

That single command copies all skills plus shared `_knowledge/` into the agent skill directory.

## Use

After installing, ask the agent normally. The router skill helps the agent select the right skill without you naming it every time.

Examples:

```text
Review this API design for production readiness.
```

```text
Grill this migration before I merge it.
```

```text
Draft a firm but respectful Slack message explaining why we should narrow this scope.
```

```text
Design the tables, indexes, constraints, and migration plan for organization invitations.
```

```text
Production checkout is returning 500s after the last deploy. Triage whether we should rollback or hotfix.
```

```text
/remember I need to send email to product manager at 10 pm tonight
```

For explicit testing, name a skill:

```text
Use the critical-thinking skill to challenge this design before we implement it.
```

## What You Get

| Area | Skills |
|---|---|
| Routing and workflow | `agent-skill-router`, `implementation-plan`, `micro-agent-orchestrator` |
| Critical judgment | `critical-thinking`, `oppenheimer-simplifier`, `change-grill-review` |
| Product and communication | `product-competitive-thinking`, `product-communication` |
| Reliability and operations | `incident-response`, `observability-design` |
| Personal productivity | `macos-reminder` |
| Implementation writers | `service-writer`, `api-writer`, `utility-writer`, `test-writer` |
| Review and quality | `code-review`, `api-review`, `database-schema-design`, `design-principles-review`, `test-design-review`, `naming-review` |
| Documentation and delivery | `code-documentation`, `commit-pr-writer` |
| Context and maintenance | `smriti-shruti`, `self-amending-skill` |

## Skill Highlights

- `agent-skill-router`: chooses and combines skills proactively.
- `critical-thinking`: challenges weak designs and says no to anti-patterns.
- `product-competitive-thinking`: reviews work through product, startup, user, and competitor lenses.
- `product-communication`: writes respectful but firm Slack, email, issue, PR, and stakeholder messages.
- `database-schema-design`: designs tables, entities, migrations, indexes, constraints, and retention.
- `api-review`: reviews API contracts, auth behavior, pagination, compatibility, and error shapes.
- `change-grill-review`: performs adversarial review for risky production changes.
- `incident-response`: triages outages, rollback/hotfix decisions, severity, handoff, and post-mortems.
- `macos-reminder`: schedules local macOS notification reminders from `/remember` style prompts.
- `observability-design`: designs logs, metrics, traces, SLOs, dashboards, and alerts.
- `service-writer`, `api-writer`, `utility-writer`, `test-writer`: keep implementation work split by responsibility.
- `smriti-shruti`: reduces noisy context while preserving the facts needed for the current task.
- `self-amending-skill`: improves the skill system safely from real usage evidence.

## Knowledge Packs

Installed skills include shared `_knowledge/` references. Agents load these only when the task calls for them, which keeps the active context lean.

| Knowledge Pack | Use For |
|---|---|
| `architecture/principles.md` | SOLID, YAGNI, dependency direction, service boundaries |
| `api/api-review.md` | API contracts, auth, pagination, idempotency, errors |
| `database/schema-design.md` | entities, constraints, indexes, migrations, retention |
| `communication/product-communication.md` | Slack, email, feedback, conflict, decision messages |
| `incident-response/incident-response.md` | severity, incident roles, rollback/hotfix, post-mortems |
| `observability/observability-design.md` | golden signals, USE/RED, SLOs, logs, metrics, traces, alerts |
| `golang/go-engineering.md` | Go services, APIs, contexts, errors, concurrency, tests |
| `react/react-engineering.md` | React components, hooks, state, effects, accessibility, tests |
| `python/python-scripting.md` | Python CLIs, filesystem work, subprocesses, logging, script tests |
| `kubernetes/kubernetes-operations.md` | workloads, probes, resources, rollouts, RBAC, secrets |
| `cloud/aws-azure-architecture.md` | AWS, Azure, EKS, AKS, managed services, identity, networking |
| `product/startup-pm.md` | MVP scope, startup product bets, competitors, learning metrics |
| `security/security-review.md` | auth, permissions, secrets, PII, tenant isolation, webhooks |
| `testing/testing-strategy.md` | test levels, contract tests, regression coverage, false confidence |

## Common Commands

List available skills:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest list
```

Run package validation:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest check
```

Search skills and knowledge:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest search "api auth pagination"
```

Print bootstrap instructions for an agent:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest bootstrap --agent claude
```

Install selected skills:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest install --agent codex --skills agent-skill-router,critical-thinking --write --force
```

Install as symlinks from a local clone:

```bash
npm run skills:install -- --agent codex --mode symlink --write --force
```

Install into a custom target:

```bash
npx -y @anuragsarkar97/ai-agent-skills@latest install --target /path/to/agent/skills --write --force
```

## How It Works

Each skill is a folder under `skills/<skill-name>/` with a canonical `SKILL.md`.

```text
skills/<skill-name>/
├── SKILL.md
├── agents/
│   ├── openai.yaml
│   └── claude.md
├── references/
├── scripts/
└── assets/
```

The `SKILL.md` file defines the trigger, workflow, checks, and output shape. Agent-specific metadata lives under `agents/`. Detailed reusable guidance lives in shared `knowledge/` and is installed as `_knowledge/` beside the skills.

## Local Development

Clone and validate:

```bash
git clone git@github.com:anuragsarkar97/skills.git
cd skills
npm test
```

Create a skill:

```bash
npm run skills:create -- my-new-skill --description "Use when an AI agent needs to..."
```

Then edit `skills/my-new-skill/SKILL.md` with concrete triggers, workflow, checks, and output shape.

Create from a stronger template:

```bash
npm run skills:create -- my-review-skill --template review --description "Use when..."
npm run skills:create -- my-writer-skill --template writer --description "Use when..."
npm run skills:create -- my-ops-skill --template ops --description "Use when..."
npm run skills:create -- my-knowledge-skill --template knowledge-backed --description "Use when..."
```

## Build And Package

One command runs the full local packaging flow:

```bash
npm run skills:package-all
```

It runs validation, regenerates the catalog and graph, packages Claude bundles, and performs an npm pack dry run.

For a publishable release, bump the version as part of the same flow:

```bash
npm run skills:package-all -- --patch
```

Use `--minor`, `--major`, or `--bump 1.2.3` when the release needs a different version change.

Create Claude-ready ZIP bundles:

```bash
npm run skills:package-claude
```

Create selected Claude bundles:

```bash
npm run skills:package-claude -- --skills agent-skill-router,critical-thinking
```

Create an npm tarball locally:

```bash
npm run skills:package-all -- --pack-tarball
```

Publish:

```bash
npm run skills:package-all -- --patch
npm publish --access public
```

Full release automation:

```bash
npm run skills:release -- --patch
```

The release script runs package-all with a version bump, writes the changelog, commits the release files, publishes to npm, tags the release, and pushes the branch and tag. Use `--dry-run` to test publish packaging without changing git or npm.

## Maintenance Scripts

```bash
npm run skills:audit
npm run skills:bootstrap -- --agent claude
npm run skills:catalog
npm run skills:changelog
npm run skills:check
npm run skills:duplicates
npm run skills:evaluate
npm run skills:examples
npm run skills:graph
npm run skills:index-project
npm run skills:knowledge-index
npm run skills:marketplace-manifest
npm run skills:refresh-knowledge
npm run skills:search -- "go service tests"
npm run skills:verify-sources
```

- `skills:check` runs validation, audit, prompt examples, evaluation hooks, and source checks.
- `skills:bootstrap` prints copy-paste agent instructions for proactive skill routing.
- `skills:catalog` writes `skills/catalog.json`.
- `skills:changelog` generates changelog text from commits since the last tag.
- `skills:graph` writes `skills/graph.json` and `skills/graph.mmd`.
- `skills:evaluate` checks prompt coverage and shared knowledge hooks.
- `skills:knowledge-index` writes `knowledge/index.json` from curated references.
- `skills:search` searches skills and shared knowledge references.
- `skills:verify-sources` verifies source metadata in knowledge references.
- `skills:refresh-knowledge` writes a review queue for source refresh work.
- `skills:index-project` writes `.skill-context/project-context.json`.

## Skill Contract

Every skill must include:

- A lowercase hyphenated directory name.
- A `SKILL.md` file.
- YAML frontmatter with only `name` and `description`.
- A `name` value that matches the directory.
- A description that clearly says what the skill does and when an agent should use it.

Keep `SKILL.md` concise. Move bulky examples, schemas, policies, framework-specific details, and source-backed guidance into shared knowledge references.

## Repository Layout

```text
.
├── agents/                 # Agent-specific usage notes
├── AGENTS.md               # Root instructions for Codex-style agents
├── CLAUDE.md               # Root instructions for Claude-style agents
├── bin/                    # npm CLI entrypoint
├── examples/               # Prompt examples for validation
├── knowledge/              # Shared curated references
├── scripts/                # Maintenance, packaging, and validation scripts
├── skills/                 # Reusable skills
└── templates/              # Skill templates
```

## Contribution Notes

- Prefer small, focused skills over broad instruction dumps.
- Add or update prompt examples when adding a skill.
- Add source notes to every shared knowledge reference.
- Run `npm run skills:package-all` before publishing or opening a large skill-system change.
- Regenerate catalog and graph artifacts when inventory, metadata, or routing changes.
