# Repository Instructions For AI Agents

This repository stores reusable AI agent skills.

## Rules

- Treat `skills/<skill-name>/SKILL.md` as the canonical instruction file.
- Keep skill frontmatter limited to `name` and `description`.
- Ensure the frontmatter `name` matches the skill directory.
- Put agent-specific metadata in `skills/<skill-name>/agents/`.
- Put large supporting details in `references/` and load them only when needed.
- Use `agent-skill-router` proactively when the user asks for engineering work but does not name a skill.
- Validate changes with `npm test` after editing skills.

## Proactive Skill Selection

- Use `implementation-plan` for scoped plans, migrations, sequencing, and validation strategy.
- Use `code-review` for general diff, PR, and worktree reviews.
- Use `change-grill-review` for risky changes, production paths, migrations, auth, or hard adversarial review.
- Use `database-schema-design` for entities, tables, ORM models, migrations, indexes, constraints, and data lifecycle.
- Use `api-review` for endpoints, request or response contracts, SDK methods, webhooks, auth behavior, pagination, and compatibility.
- Use `naming-review` for identifiers, domain terminology, API fields, table names, events, files, and test names.
- Use `commit-pr-writer` for commit messages, PR descriptions, changelog entries, and reviewer notes.
- Use `code-documentation` for comments, docstrings, README content, API docs, examples, and architecture notes.
- Use `test-design-review` for test design, test review, coverage gaps, weak mocks, and flaky tests.
- Use `design-principles-review` for SOLID, YAGNI, abstraction quality, module boundaries, dependency direction, and maintainability.

## Editing Guidance

- Prefer small, focused skills over broad instruction dumps.
- Do not duplicate long operational guidance across agent-specific files.
- Keep scripts deterministic and test representative script behavior before committing them.
