---
name: agent-skill-router
description: "Select a specialized repository workflow when an engineering request does not name a skill. Skip additional skills when ordinary coding judgment is sufficient."
---

# Agent Skill Router

Select by the outcome and risk, not every technology mentioned. Ordinary coding, naming, test writing, concise output, and context management do not need separate skills.

## Selection

- Honor an explicitly requested skill when it is available. Do not assume every skill in this source catalog is installed in a partial profile. Otherwise use one primary workflow when it adds task-specific value; using no additional skill is valid.
- Add a second skill only for a distinct unresolved risk or deliverable. A cross-layer edit does not require a chain of writer and reviewer invocations.
- Read the relevant files directly when their location is known. Generate maps and decision ledgers only when the task benefits from those artifacts.
- Do not manufacture a plan, product strategy review, commit message, or approval checkpoint for every change.

## Routing Rules

- `dribbble-design`: frontend visual directions, Dribbble-style inspiration, reference analysis, moodboards, or visual UI critique; not backend design principles.

- `harness-engineering`: coding-agent environments, completion graders, reproducibility, and measured harness improvements.
- `agentic-engineering`: tool-using applications, execution graphs, durable recovery, and justified delegation.
- `graph-engineering`: knowledge/dependency graphs, temporal facts, and GraphRAG retrieval; not execution graphs or chart drawing.

- `implementation-plan`: requested plans or changes with sequencing, migration, or rollout dependencies.
- `product-competitive-thinking`: product bets, MVP scope, pricing, onboarding, or competitive strategy decisions.
- `repository-map`: broad repository discovery when direct file search is insufficient.
- `decision-memory`: recording decisions or revisiting prior rationale.
- `incident-response`: active production degradation or post-mortems.
- `observability-design`: instrumentation, telemetry audits, SLOs, or alerts.
- `security-review`: changed trust boundaries or explicit security review.
- `code-review`: code, API contract, test adequacy, or regression review.
- `database-schema-design`: durable data shape, indexes, constraints, or migration rollout.

## Knowledge Routing

- Frontend visual direction and reference analysis: `../_knowledge/frontend/design-inspiration.md`.

- Agent environments and evaluation: `../_knowledge/agents/harness-engineering.md`.
- Agent control flow, tools, context, and recovery: `../_knowledge/agents/agentic-engineering.md`.
- Knowledge/dependency graph modeling and retrieval: `../_knowledge/graphs/graph-engineering.md`.

When a task needs deeper context, load only the relevant shared reference. In installed agents, shared references live next to the skills at `../_knowledge/`. In this source repository, the same files live at `../../knowledge/` from each skill folder.

- Cross-cutting agent behavior, tool routing, context discipline, freshness, safety boundaries, and output discipline: read `../_knowledge/agent-behavior/operating-principles.md`.
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

Load only references that resolve a task-specific question. Do not load all references or generate a repository map for a local edit.

Load the agent behavior reference when the task involves adapting broad model instructions into reusable skills, reviewing model-specific prompt assumptions, or resolving conflicts between user preferences, memory, tools, safety, and concise output.

## Execution Boundaries

Keep validation and authorization at trust boundaries. Follow existing code ownership without creating layers solely to match skill names. Complete the affected callers, tests, fixtures, configuration, and docs that the requested change needs.

Use available tools and local conventions. Do not assume a model has browsing, subagents, memory, or external write access merely because it supports those capabilities elsewhere. Follow the host's permission rules and the user's existing authorization; ask only when an unresolved boundary requires it.

## Completion Check

Verify the requested outcome with checks appropriate to the changed behavior. Report evidence, remaining blockers, and material unverified risks. Static prompt examples validate fixture consistency, not model routing quality. Stop after the acceptance checks pass unless new evidence warrants more work.
