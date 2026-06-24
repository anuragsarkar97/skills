# AI Agent Skills

A portable skills repository for AI coding agents such as Codex and Claude.

Skills live under `skills/<skill-name>/` and use a `SKILL.md` file as the canonical instruction source. Agent-specific files can sit beside it under `agents/` when an agent needs metadata or install notes.

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

## Skill Catalog

- `agent-skill-router`: choose and combine skills proactively.
- `api-review`: review API contracts and compatibility.
- `change-grill-review`: adversarial review for hidden production risks.
- `code-documentation`: create and review practical code docs.
- `code-review`: general code review focused on bugs and regressions.
- `commit-pr-writer`: write commit messages and PR text.
- `database-schema-design`: design and review entities, tables, migrations, indexes, and constraints.
- `design-principles-review`: check SOLID, YAGNI, abstractions, and boundaries.
- `implementation-plan`: plan scoped software changes and validation.
- `naming-review`: improve identifiers and domain terminology.
- `test-design-review`: design and stress-review tests.

## Validate

```bash
npm test
```

The validator checks required frontmatter, naming rules, and basic agent metadata shape without external dependencies.

## Create A Skill

```bash
cp -R templates/skill skills/my-new-skill
```

Then edit `skills/my-new-skill/SKILL.md` so the frontmatter `name` is `my-new-skill`.

Keep `SKILL.md` concise. Move bulky examples, schemas, policies, and framework-specific details into `references/` and mention when to read them.
