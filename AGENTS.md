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
- Use `self-amending-skill` when real usage shows a skill needs tighter triggers, better workflow, routing changes, validation, or supporting scripts.
- Use `critical-thinking` before agreeing to designs, shortcuts, refactors, or implementation approaches that may be unsafe, overbuilt, incoherent, or anti-patterned.
- Use `product-competitive-thinking` before product-facing implementation, startup roadmap choices, MVP scope, onboarding, pricing, UX flows, and competitor-driven feature requests.
- Use `product-communication` for Slack, Teams, email, ticket, issue, PR, stakeholder, customer, and product decision messages that need respectful but firm communication.
- Use `smriti-shruti` for context triage, token reduction, stale context, repeated logs, and noisy large inputs.
- Use `oppenheimer-simplifier` for complex, ambiguous, tangled, or high-cognitive-load problems.
- Use `micro-agent-orchestrator` when implementation should be split across focused writer skills.
- Use `service-writer` for service-layer workflows, orchestration, transactions, permissions, and domain behavior.
- Use `utility-writer` for helpers, parsers, formatters, validators, mappers, adapters, and reusable transformations.
- Use `api-writer` for route handlers, controllers, request validation, response shaping, status codes, and endpoint wiring.
- Use `test-writer` to implement targeted tests for changed behavior.
- Use `incident-response` for production degradation, outages, rollback or hotfix decisions, on-call triage, and post-mortems.
- Use `observability-design` for structured logs, metrics, traces, SLOs, dashboards, alerts, and telemetry gaps.
- Use `code-review` for general diff, PR, and worktree reviews.
- Use `change-grill-review` for risky changes, production paths, migrations, auth, or hard adversarial review.
- Use `database-schema-design` for entities, tables, ORM models, migrations, indexes, constraints, and data lifecycle.
- Use `api-review` for endpoints, request or response contracts, SDK methods, webhooks, auth behavior, pagination, and compatibility.
- Use `naming-review` for identifiers, domain terminology, API fields, table names, events, files, and test names.
- Use `commit-pr-writer` for commit messages, PR descriptions, changelog entries, and reviewer notes.
- Use `code-documentation` for comments, docstrings, README content, API docs, examples, and architecture notes.
- Use `test-design-review` for test design, test review, coverage gaps, weak mocks, and flaky tests.
- Use `design-principles-review` for SOLID, YAGNI, abstraction quality, module boundaries, dependency direction, and maintainability.

Agents may say no to the user when the requested design is an anti-pattern or creates avoidable security, data, reliability, or maintenance risk. When saying no, explain the concrete risk and offer the smallest safer alternative.

For startup product work, agents should also push back when a request is strategically weak: commodity feature chasing, unclear target user, no activation or retention path, or implementation cost that does not buy learning or differentiation.

When communicating through Slack or other channels, agents should be kind, specific, and firm. Do not agree to weak decisions just to keep tone pleasant; explain the tradeoff and propose the next useful step.

For the primary stack, load stack-specific knowledge when relevant: Go backend/service work, React frontend work, Python scripting, Kubernetes operations, and AWS/Azure infrastructure. Do not apply generic advice when a curated stack reference exists.

## Editing Guidance

- Prefer small, focused skills over broad instruction dumps.
- Do not duplicate long operational guidance across agent-specific files.
- Keep scripts deterministic and test representative script behavior before committing them.
- Run `npm run skills:catalog` after adding, removing, or materially changing skill metadata.
- Run `npm run skills:audit`, `npm run skills:examples`, and `npm run skills:graph` after changing routing, triggers, or metadata.
- Prefer `npm run skills:check` before finishing any skill-system change.
