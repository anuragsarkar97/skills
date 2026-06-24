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
- `critical-thinking` before agreeing to risky, overbuilt, incoherent, or anti-patterned designs.
- `product-competitive-thinking` before product-facing work, MVP scope, UX, onboarding, pricing, or competitor-driven requests.
- `smriti-shruti` for context triage and token reduction.
- `oppenheimer-simplifier` for simplifying complex problems before solving.
- `micro-agent-orchestrator` for splitting implementation across writer skills.
- `service-writer` for service-layer behavior.
- `utility-writer` for focused helper code.
- `api-writer` for API boundary implementation.
- `test-writer` for targeted test implementation.
- `code-review` for normal code review.
- `change-grill-review` for adversarial review.
- `database-schema-design` for persistence and migrations.
- `api-review` for service contracts.
- `naming-review` for terminology and identifiers.
- `commit-pr-writer` for commit and PR text.
- `code-documentation` for docs and examples.
- `test-design-review` for tests and coverage.
- `design-principles-review` for SOLID, YAGNI, and design boundaries.

It is acceptable to say no to the user when the requested design is an anti-pattern. Be direct, give evidence, and propose the smallest safer alternative.

For startup product decisions, also evaluate user pain, product bet, competitive alternatives, differentiation, and MVP scope before recommending implementation.
