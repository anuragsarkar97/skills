# AI Agent Skills

A portable skills repository for AI coding agents such as Codex and Claude.

Skills live under `skills/<skill-name>/` and use a `SKILL.md` file as the canonical instruction source. Agent-specific files can sit beside it under `agents/` when an agent needs metadata or install notes.

## Quick Start

```bash
git clone git@github.com:anuragsarkar97/skills.git
cd skills
npm test
```

Install every skill into Codex:

```bash
npm run skills:install -- --agent codex --write
```

Install every skill into Claude:

```bash
npm run skills:install -- --agent claude --write
```

By default, install commands copy skills into the agent skill directory. Use `--mode symlink` if you want installed skills to track this repository directly.

## Repository Layout

```text
.
├── agents/                 # Agent-specific usage notes
├── AGENTS.md               # Root instructions for Codex-style agents
├── CLAUDE.md               # Root instructions for Claude-style agents
├── scripts/                # Local maintenance and validation scripts
├── skills/                 # Reusable skills
│   └── <skill-name>/
│       ├── SKILL.md        # Required skill instructions
│       ├── agents/         # Optional agent metadata
│       ├── references/     # Optional docs loaded only when needed
│       ├── scripts/        # Optional deterministic helpers
│       └── assets/         # Optional reusable output assets
└── templates/              # Templates for new skills
```

## Skill Contract

Every skill must include:

- A directory name using lowercase letters, numbers, and hyphens.
- A `SKILL.md` file.
- YAML frontmatter with only `name` and `description`.
- A `name` value that exactly matches the directory name.
- A description that says what the skill does and when an agent should use it.

Optional resources:

- `agents/openai.yaml` for Codex/OpenAI-facing metadata.
- `agents/claude.md` for Claude-facing notes when needed.
- `references/` for detailed documentation.
- `scripts/` for repeatable commands or deterministic transformations.
- `assets/` for templates, images, fixtures, or other reusable materials.

For proactive agent selection, set `policy.allow_implicit_invocation: true` in `agents/openai.yaml` and keep the `description` trigger precise.

## What Each Skill Contains

Each skill folder can contain:

- `SKILL.md`: the canonical trigger description and agent instructions.
- `agents/openai.yaml`: OpenAI/Codex-facing metadata, default prompt, and implicit invocation policy.
- `agents/claude.md`: Claude-specific usage notes.
- `references/`: optional deeper docs loaded only when needed.
- `scripts/`: optional deterministic helper scripts.
- `assets/`: optional templates, fixtures, or reusable output assets.

## Skill Catalog

| Category | Skills |
|---|---|
| Routing and workflow | `agent-skill-router`, `implementation-plan`, `micro-agent-orchestrator` |
| Critical judgment | `critical-thinking`, `oppenheimer-simplifier`, `change-grill-review` |
| Product and communication | `product-competitive-thinking`, `product-communication` |
| Implementation writers | `service-writer`, `api-writer`, `utility-writer`, `test-writer` |
| Review and quality | `code-review`, `api-review`, `database-schema-design`, `design-principles-review`, `test-design-review`, `naming-review` |
| Documentation and delivery | `code-documentation`, `commit-pr-writer` |
| Context and skill maintenance | `smriti-shruti`, `self-amending-skill` |

The generated machine-readable catalog is in `skills/catalog.json`, and the generated skill relationship graph is in `skills/graph.json` plus `skills/graph.mmd`.

## Skill List

- `agent-skill-router`: choose and combine skills proactively.
- `api-review`: review API contracts and compatibility.
- `api-writer`: implement API handlers, validation, response shaping, and endpoint wiring.
- `change-grill-review`: adversarial review for hidden production risks.
- `code-documentation`: create and review practical code docs.
- `code-review`: general code review focused on bugs and regressions.
- `commit-pr-writer`: write commit messages and PR text.
- `critical-thinking`: challenge weak designs before agreeing and say no to anti-patterns.
- `database-schema-design`: design and review entities, tables, migrations, indexes, and constraints.
- `design-principles-review`: check SOLID, YAGNI, abstractions, and boundaries.
- `implementation-plan`: plan scoped software changes and validation.
- `micro-agent-orchestrator`: split implementation work across focused writer skills.
- `naming-review`: improve identifiers and domain terminology.
- `oppenheimer-simplifier`: simplify complex engineering problems before solving.
- `product-communication`: write respectful but firm product and stakeholder messages.
- `product-competitive-thinking`: apply product manager and competitor lenses before building.
- `self-amending-skill`: safely improve skills and routing from real usage evidence.
- `service-writer`: implement service-layer business workflows.
- `smriti-shruti`: triage context and reduce token load.
- `test-design-review`: design and stress-review tests.
- `test-writer`: implement targeted tests for behavior changes.
- `utility-writer`: implement small reusable utility code.

## Install Skills

Install commands dry-run unless `--write` is passed.

Dry-run install all skills into Codex:

```bash
npm run skills:install -- --agent codex
```

Install all skills into Codex:

```bash
npm run skills:install -- --agent codex --write
```

Install all skills into Claude:

```bash
npm run skills:install -- --agent claude --write
```

Install selected skills:

```bash
npm run skills:install -- --agent codex --skills agent-skill-router,critical-thinking --write
```

Install as symlinks instead of copies:

```bash
npm run skills:install -- --agent codex --skills agent-skill-router --mode symlink --write
```

Install into a custom directory:

```bash
npm run skills:install -- --target /path/to/agent/skills --write
```

Use `--force` to replace existing installed skill folders. Use `--remove-stale` only for directories managed by this repository.

## Validate

```bash
npm test
npm run skills:check
npm run skills:audit
npm run skills:examples
```

The validator checks required frontmatter, naming rules, and basic agent metadata shape without external dependencies.
The audit checks routing, metadata quality, implicit invocation, stale catalogs, and broad skill hygiene.
The example harness checks that every skill has at least one implicit prompt example.
`skills:check` runs validation, audit, and prompt examples as the standard workflow gate.

## Workflow Scripts

```bash
npm test
npm run skills:audit
npm run skills:create -- my-skill --description "Use when..."
npm run skills:duplicates
npm run skills:examples
npm run skills:graph
npm run skills:import -- ../external-skill-folder
npm run skills:intake -- ../external-skill-folder
npm run skills:intake -- git@github.com:org/skills.git#skills/the-skill
npm run skills:install -- --target /tmp/agent-skills --all
npm run skills:import -- git@github.com:org/skills.git#skills/the-skill
npm run skills:import -- ../external-skill-folder --path /tmp/skills
npm run skills:catalog
```

- `skills:audit` checks metadata quality, router coverage, catalog freshness, and common skill quality issues.
- `skills:check` runs the default validation, audit, and prompt-example gate.
- `skills:create` creates a local skill scaffold with OpenAI and Claude metadata.
- `skills:duplicates` runs a Python overlap audit for likely duplicate skills.
- `skills:examples` validates implicit prompt examples in `examples/skill-prompts.json`.
- `skills:graph` writes `skills/graph.json` and `skills/graph.mmd` from skill references.
- `skills:import` imports a single skill from a local path or Git URL plus optional `#subdir`.
- `skills:intake` copies an external skill into `.skill-intake/`, validates it there, and can accept it after review.
- `skills:install` dry-runs installation into an agent skill directory by default; pass `--write` to actually copy or symlink.
- `skills:catalog` writes `skills/catalog.json` for agent discovery, audits, and external tooling.

## Create A Skill

```bash
npm run skills:create -- my-new-skill --description "Use when an AI agent needs to..."
```

Then edit `skills/my-new-skill/SKILL.md` with the concrete workflow, checks, and output shape.

Keep `SKILL.md` concise. Move bulky examples, schemas, policies, and framework-specific details into `references/` and mention when to read them.
