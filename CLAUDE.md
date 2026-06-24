# Claude Instructions

This repository contains portable skills for AI agents. Use `skills/<skill-name>/SKILL.md` as the source of truth for each skill.

## Working In This Repository

- Validate skill changes with `npm test`.
- Keep shared instructions in `SKILL.md`.
- Use `agents/claude.md` inside a skill only for Claude-specific notes.
- Do not add bulky documentation to `SKILL.md`; place it in `references/` and mention when it should be read.
- Preserve compatibility with Codex/OpenAI metadata by keeping `agents/openai.yaml` concise.

## Proactive Skill Use

Start with `agent-skill-router` when the user asks for engineering work but does not name a skill. Then select the smallest relevant set:

- `implementation-plan` for plans and validation strategy.
- `code-review` for normal code review.
- `change-grill-review` for adversarial review.
- `database-schema-design` for persistence and migrations.
- `api-review` for service contracts.
- `naming-review` for terminology and identifiers.
- `commit-pr-writer` for commit and PR text.
- `code-documentation` for docs and examples.
- `test-design-review` for tests and coverage.
- `design-principles-review` for SOLID, YAGNI, and design boundaries.
