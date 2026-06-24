---
name: agent-skill-router
description: Select and combine repository skills proactively for software engineering tasks. Use when an AI agent needs to decide which skill to invoke for code review, API review, schema design, naming, documentation, tests, design principles, commits, PRs, or adversarial change review without the engineer explicitly naming a skill.
---

# Agent Skill Router

Use this skill as the first pass when the user asks for engineering help but does not name a skill. Select the smallest useful set of skills and apply them without making the user ask.

## Routing Rules

- Use `implementation-plan` when the task needs sequencing, scoping, migration planning, or validation strategy.
- Use `code-review` for general review of diffs, pull requests, and worktrees.
- Use `change-grill-review` when the user asks to be grilled, the change is risky, or a normal review would be too gentle.
- Use `database-schema-design` for tables, entities, migrations, indexes, data retention, and persistence models.
- Use `api-review` for endpoints, request or response contracts, SDK methods, webhooks, auth behavior, pagination, and compatibility.
- Use `naming-review` when identifiers, domain terms, API fields, table names, or test names are central to the change.
- Use `commit-pr-writer` when preparing commit messages, PR descriptions, changelog text, or reviewer notes.
- Use `code-documentation` when adding or reviewing docs, comments, examples, README content, or architecture notes.
- Use `test-design-review` when creating tests, reviewing tests, checking coverage, or investigating flaky or weak tests.
- Use `design-principles-review` for SOLID, YAGNI, abstraction quality, module boundaries, dependency direction, and maintainability.

## Combination Rules

- Schema plus endpoint changes: use `database-schema-design` and `api-review`; add `test-design-review` for contract and migration coverage.
- Large feature changes: use `implementation-plan`, then `test-design-review`, then `code-review`.
- Risky production changes: use `change-grill-review` with the relevant domain skill.
- Refactors: use `design-principles-review`, `naming-review`, and `test-design-review`.
- Finalization: use `commit-pr-writer` after implementation and validation.

## Behavior

Do not announce every skill selection unless it helps the user. Apply the relevant checklist silently, then explain the findings or output in normal engineering language.
