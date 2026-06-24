---
name: agent-skill-router
description: Select and combine repository skills proactively for software engineering tasks. Use when an AI agent needs to decide which skill to invoke for skill maintenance, product communication, product and competitor thinking, critical thinking, implementation, micro-agent writing, context triage, problem simplification, code review, API review, schema design, naming, documentation, tests, design principles, commits, PRs, or adversarial change review without the engineer explicitly naming a skill.
---

# Agent Skill Router

Use this skill as the first pass when the user asks for engineering help but does not name a skill. Select the smallest useful set of skills and apply them without making the user ask.

## Routing Rules

- Use `implementation-plan` when the task needs sequencing, scoping, migration planning, or validation strategy.
- Use `self-amending-skill` when real usage shows a skill has missing triggers, stale guidance, weak routing, duplicated instructions, validation gaps, or inefficient workflow.
- Use `critical-thinking` before agreeing to designs, plans, shortcuts, refactors, or implementation requests that may be incoherent, overbuilt, unsafe, or anti-patterned.
- Use `product-competitive-thinking` before product-facing implementation, startup roadmap choices, MVP scope, onboarding, pricing, UX flows, or competitor-driven feature requests.
- Use `product-communication` for Slack, Teams, email, ticket, issue, PR, stakeholder, customer, or product decision messages that need kind but firm communication.
- Use `smriti-shruti` when context is large, stale, repetitive, or distracting and should be summarized, ignored, or deferred.
- Use `oppenheimer-simplifier` when the problem is complex, ambiguous, tangled, or likely to cause implementation thrash.
- Use `micro-agent-orchestrator` when implementation spans service, utility, API, and test layers.
- Use `service-writer` for service-layer business logic, orchestration, transactions, permissions, and domain workflows.
- Use `utility-writer` for pure helpers, parsers, formatters, validators, mappers, adapters, and small reusable transformations.
- Use `api-writer` for route handlers, controllers, request validation, response shaping, status codes, API errors, and endpoint wiring.
- Use `test-writer` to implement focused tests for changed behavior, bug regressions, APIs, services, and utilities.
- Use `code-review` for general review of diffs, pull requests, and worktrees.
- Use `change-grill-review` when the user asks to be grilled, the change is risky, or a normal review would be too gentle.
- Use `database-schema-design` for tables, entities, migrations, indexes, data retention, and persistence models.
- Use `api-review` for endpoints, request or response contracts, SDK methods, webhooks, auth behavior, pagination, and compatibility.
- Use `naming-review` when identifiers, domain terms, API fields, table names, or test names are central to the change.
- Use `commit-pr-writer` when preparing commit messages, PR descriptions, changelog text, or reviewer notes.
- Use `code-documentation` when adding or reviewing docs, comments, examples, README content, or architecture notes.
- Use `test-design-review` when creating tests, reviewing tests, checking coverage, or investigating flaky or weak tests.
- Use `design-principles-review` for SOLID, YAGNI, abstraction quality, module boundaries, dependency direction, and maintainability.

## Knowledge Routing

When a task needs deeper context, load only the relevant shared reference. In installed agents, shared references live next to the skills at `../_knowledge/`. In this source repository, the same files live at `../../knowledge/` from each skill folder.

- Architecture, SOLID, YAGNI, or boundaries: read `../_knowledge/architecture/principles.md`.
- API contracts, auth, pagination, idempotency, or errors: read `../_knowledge/api/api-review.md`.
- Schema, migrations, constraints, indexes, or retention: read `../_knowledge/database/schema-design.md`.
- Startup roadmap, MVP, competitor, pricing, onboarding, or UX tradeoffs: read `../_knowledge/product/startup-pm.md`.
- Auth, permissions, secrets, PII, uploads, webhooks, or tenant isolation: read `../_knowledge/security/security-review.md`.
- Test strategy, coverage, flakiness, or level selection: read `../_knowledge/testing/testing-strategy.md`.

Do not load all references by default. Use `smriti-shruti` when reference material or project context becomes noisy.

## Combination Rules

- Schema plus endpoint changes: use `database-schema-design` and `api-review`; add `test-design-review` for contract and migration coverage.
- Suspicious design request: use `critical-thinking` first; if the request is valid but complex, continue with `oppenheimer-simplifier` or `implementation-plan`.
- Product feature request: use `critical-thinking` and `product-competitive-thinking` before implementation; if the bet is sound, continue with `implementation-plan` and `micro-agent-orchestrator`.
- Product decision message: use `critical-thinking` and `product-competitive-thinking` for the reasoning, then `product-communication` for the message.
- Slack or stakeholder update: use `product-communication`; add `commit-pr-writer` only when the message is primarily a PR or release summary.
- Skill system improvement: use `self-amending-skill`, then run `npm test`, `npm run skills:audit`, and `npm run skills:catalog` or `npm run skills:graph` if inventory, metadata, or references changed.
- Large feature changes: use `smriti-shruti` if context is noisy, `oppenheimer-simplifier` if the problem is unclear, `implementation-plan` for sequencing, `micro-agent-orchestrator` for implementation, then `test-design-review` and `code-review`.
- Service plus API implementation: use `micro-agent-orchestrator`, then `service-writer`, `api-writer`, and `test-writer`; add `api-review` when contracts change.
- Utility extraction: use `utility-writer`, `naming-review`, and `test-writer`; add `design-principles-review` if abstraction pressure is unclear.
- Risky production changes: use `change-grill-review` with the relevant domain skill.
- Refactors: use `design-principles-review`, `naming-review`, and `test-design-review`.
- Anti-pattern risk: use `critical-thinking`, then `design-principles-review`; say no clearly when the safer answer is not to implement the requested design.
- Finalization: use `commit-pr-writer` after implementation and validation.

## Behavior

Do not announce every skill selection unless it helps the user. Apply the relevant checklist silently, then explain the findings or output in normal engineering language.
