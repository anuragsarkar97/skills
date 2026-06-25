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
- `self-amending-skill` for evidence-based improvements to skills, routing, validation, or tooling.
- `critical-thinking` before agreeing to risky, overbuilt, incoherent, or anti-patterned designs.
- `product-competitive-thinking` before product-facing work, MVP scope, UX, onboarding, pricing, or competitor-driven requests.
- `product-communication` for Slack, Teams, email, ticket, issue, PR, stakeholder, customer, and product decision messages.
- `macos-reminder` for `/remember`, "remind me", or "notify me" requests that should become local macOS notifications.
- `smriti-shruti` for context triage and token reduction.
- `oppenheimer-simplifier` for simplifying complex problems before solving.
- `micro-agent-orchestrator` for splitting implementation across writer skills.
- `service-writer` for service-layer behavior.
- `utility-writer` for focused helper code.
- `api-writer` for API boundary implementation.
- `test-writer` for targeted test implementation.
- `incident-response` for production outages, regressions, rollback or hotfix decisions, and post-mortems.
- `observability-design` for logs, metrics, traces, SLOs, dashboards, alerts, and telemetry gaps.
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

When writing product communication, be respectful but firm. Do not agree automatically; acknowledge the goal, state the concern, and offer the next useful step.

For Go, React, Python scripting, Kubernetes, AWS, and Azure work, load the matching shared knowledge reference when the stack affects design, implementation, review, tests, observability, or incident response.

For skill-system changes, prefer `npm run skills:check`; regenerate `skills/catalog.json` with `npm run skills:catalog` and the graph with `npm run skills:graph` when inventory, metadata, or references change.
