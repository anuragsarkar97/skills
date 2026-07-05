---
name: agent-skill-router
description: Select and combine repository skills proactively for software engineering tasks. Use when an AI agent needs to decide which skill to invoke for skill maintenance, product communication, product and competitor thinking, upskilling research, human or AI drift correction, critical thinking, implementation, micro-agent writing, context triage, terse output, problem simplification, code review, API review, schema design, naming, documentation, tests, design principles, commits, PRs, or adversarial change review without the engineer explicitly naming a skill.
---

# Agent Skill Router

Use this skill as the first pass when the user asks for engineering help but does not name a skill. Select the smallest useful set of skills and apply them without making the user ask.

## Routing Rules

- Use `implementation-plan` when the task needs sequencing, scoping, migration planning, or validation strategy.
- Use `self-amending-skill` when real usage shows a skill has missing triggers, stale guidance, weak routing, duplicated instructions, validation gaps, or inefficient workflow.
- Use `wtf-check` when the human or AI is drifting, thrashing, over-scoping, context-switching, contradicting the goal, chasing novelty, or continuing without a clear next useful move.
- Use `critical-thinking` before agreeing to designs, plans, shortcuts, refactors, or implementation requests that may be incoherent, overbuilt, unsafe, or anti-patterned.
- Use `product-competitive-thinking` before product-facing implementation, startup roadmap choices, MVP scope, onboarding, pricing, UX flows, or competitor-driven feature requests.
- Use `product-communication` for Slack, Teams, email, ticket, issue, PR, stakeholder, customer, or product decision messages that need kind but firm communication.
- Use `upskilling-research` when the user wants to learn, upskill, study, find recent reads, find blogs, papers, talks, videos, or build a learning path for a domain.
- Use `work-impact-tracker` when the user wants to record accomplishments, maintain a brag document, review recent work impact, or prepare a performance appraisal.
- Use `macos-reminder` for `/remember`, "remind me", "notify me", "later today", "tonight", or "tomorrow" requests that should become local macOS notifications.
- Use `caveman-mode` when the user asks for terse output, low-token answers, no overexplaining, direct answers only, or says not to answer unless directly relevant.
- Use `smriti-shruti` when context is large, stale, repetitive, or distracting and should be summarized, ignored, or deferred.
- Use `repository-map` when entering an unfamiliar repository or discovering stack, commands, conventions, files, and symbols.
- Use `decision-memory` when recording an engineering decision or checking prior rationale and rejected alternatives before a high-impact change.
- Use `oppenheimer-simplifier` when the problem is complex, ambiguous, tangled, or likely to cause implementation thrash.
- Use `service-writer` for service-layer business logic, orchestration, transactions, permissions, and domain workflows.
- Use `utility-writer` for pure helpers, parsers, formatters, validators, mappers, adapters, and small reusable transformations.
- Use `api-writer` for route handlers, controllers, request validation, response shaping, status codes, API errors, and endpoint wiring.
- Use `test-writer` to implement focused tests for changed behavior, bug regressions, APIs, services, and utilities.
- Use `incident-response` when production is degraded, error rates spike, a deploy causes regressions, or the user is in active on-call triage.
- Use `observability-design` when adding appropriate logs to code, reviewing logging noise or instrumentation gaps, adding service telemetry, defining metric naming, or designing alerts.
- Use `security-review` when reviewing authentication, authorization, tenant isolation, secrets, PII, uploads, webhooks, injection, or dependency trust.
- Use `code-review` for normal reviews and adversarial grills of risky changes, diffs, pull requests, migrations, plans, tests, and worktrees.
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
- Firm but kind Slack, email, feedback, conflict, escalation, or decision communication: read `../_knowledge/communication/product-communication.md`.
- Production outage, rollback/hotfix choice, severity, post-mortem, or on-call handoff: read `../_knowledge/incident-response/incident-response.md`.
- Logs, metrics, traces, SLOs, alert thresholds, or telemetry gaps: read `../_knowledge/observability/observability-design.md`.
- Go services, APIs, workers, utilities, tests, goroutines, or context handling: read `../_knowledge/golang/go-engineering.md`.
- React components, hooks, state, effects, accessibility, frontend API integration, or frontend tests: read `../_knowledge/react/react-engineering.md`.
- Python automation, repo tooling, data transforms, CLIs, subprocesses, or maintenance scripts: read `../_knowledge/python/python-scripting.md`.
- Kubernetes workloads, probes, resources, rollouts, RBAC, secrets, or cluster operations: read `../_knowledge/kubernetes/kubernetes-operations.md`.
- AWS or Azure architecture, managed services, identity, networking, EKS, AKS, reliability, or cloud observability: read `../_knowledge/cloud/aws-azure-architecture.md`.

Do not load all references by default. Use `smriti-shruti` when reference material or project context becomes noisy.

## Implementation Orchestration

When work crosses layers, split it by ownership and invoke only the relevant writers:

- `service-writer` owns workflows, permissions, transactions, and domain behavior.
- `api-writer` owns transport validation, status codes, responses, and endpoint wiring.
- `utility-writer` owns pure parsers, validators, mappers, and adapters.
- `test-writer` protects the changed behavior at the lowest meaningful level.

Keep API rules out of utilities, business rules out of handlers, and implementation details out of behavioral tests. After implementation, use `test-design-review` for coverage quality and `code-review` for risk.

## Combination Rules

- Schema plus endpoint changes: use `database-schema-design` and `api-review`; add `test-design-review` for contract and migration coverage.
- Suspicious design request: use `critical-thinking` first; if the request is valid but complex, continue with `oppenheimer-simplifier` or `implementation-plan`.
- Product feature request: use `critical-thinking` and `product-competitive-thinking` before implementation; if the bet is sound, continue with `implementation-plan` and the relevant writer skills.
- Product decision message: use `critical-thinking` and `product-competitive-thinking` for the reasoning, then `product-communication` for the message.
- Drift or thrash: use `wtf-check` first; then choose `smriti-shruti` for noisy context, `critical-thinking` for flawed design, `product-competitive-thinking` for weak product direction, or `implementation-plan` after the reset is accepted.
- Learning request: use `upskilling-research`; browse for current high-signal sources and turn them into a focused learning path.
- Work tracking or appraisal request: use `work-impact-tracker`; keep personal records in the configured local worklog and distinguish confirmed impact from inferred activity.
- Slack or stakeholder update: use `product-communication`; add `commit-pr-writer` only when the message is primarily a PR or release summary.
- Local reminder request: use `macos-reminder`; clarify the message or time if ambiguous before scheduling.
- Terse mode request: use `caveman-mode` as an output governor with the relevant task skill; add `smriti-shruti` if the issue is context volume.
- Skill system improvement: use `self-amending-skill`, then run `npm test`, `npm run skills:audit`, and `npm run skills:catalog` or `npm run skills:graph` if inventory, metadata, or references changed.
- Unfamiliar repository or expensive cold start: use `repository-map` for project conventions, files, and symbols; restrict follow-up searches to the discovered paths.
- Architecture or high-impact engineering decision: use `decision-memory` to check prior rationale before proposing a change; record only decisions established by the user or repository evidence.
- Large feature changes: use `smriti-shruti` if context is noisy, `oppenheimer-simplifier` if the problem is unclear, `implementation-plan` for sequencing, the relevant writer skills for implementation, then `test-design-review` and `code-review`.
- Service plus API implementation: split work across `service-writer`, `api-writer`, and `test-writer`; add `api-review` when contracts change.
- Utility extraction: use `utility-writer`, `naming-review`, and `test-writer`; add `design-principles-review` if abstraction pressure is unclear.
- Production incident: use `incident-response` to triage; add `product-communication` for status updates to stakeholders; use `implementation-plan` for the follow-up fix.
- New service implementation: use `service-writer`, `api-writer`, `test-writer`, and `observability-design` so telemetry is built in from the start.
- Go backend implementation: use `service-writer`, `api-writer`, or `utility-writer` with `../_knowledge/golang/go-engineering.md`; add `test-writer` for table-driven and boundary tests.
- React frontend implementation: use `implementation-plan` or `code-review` with `../_knowledge/react/react-engineering.md`; add `test-design-review` for user-visible behavior tests.
- Python automation: use `utility-writer` with `../_knowledge/python/python-scripting.md`; add `test-writer` for parsing, filesystem, and subprocess boundaries.
- AWS, Azure, or Kubernetes infrastructure: use `implementation-plan`, `observability-design`, and `incident-response` as appropriate; load the cloud and Kubernetes knowledge references before proposing rollout or recovery steps.
- Post-incident hardening: use `observability-design` to fill telemetry gaps, then use `code-review` in adversarial mode before the fix ships.
- Risky production changes: use `code-review` in adversarial mode with the relevant domain skill.
- Security-sensitive changes: use `security-review` with the relevant domain skill. For auth tables, PII columns, or tenant isolation fields, also use `database-schema-design`, `api-review`, and adversarial `code-review`.
- Renaming PRs (identifier renames, domain term changes, API field renames): use `naming-review` first to validate the new names, then `commit-pr-writer` to capture the rename rationale in the PR description.
- Refactors: use `design-principles-review`, `naming-review`, and `test-design-review`.
- Anti-pattern risk: use `critical-thinking`, then `design-principles-review`; say no clearly when the safer answer is not to implement the requested design.
- Finalization: use `commit-pr-writer` after implementation and validation.

## Behavior

Do not announce every skill selection unless it helps the user. Apply the relevant checklist silently, then explain the findings or output in normal engineering language.
