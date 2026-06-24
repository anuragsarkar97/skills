---
name: service-writer
description: Write focused service-layer and application-layer code for business workflows, orchestration, domain operations, transactions, permissions, and data access coordination. Use when an AI agent implements behavior that should live behind API handlers and above low-level utilities or repositories.
---

# Service Writer

Use this skill for code that owns application behavior. Service code should express business workflow and coordinate collaborators without becoming a dumping ground.

For Go services, read `../_knowledge/golang/go-engineering.md` when installed or `../../knowledge/golang/go-engineering.md` in this repository. For services deployed on AWS, Azure, or Kubernetes, also read the relevant cloud or Kubernetes shared reference when deployment behavior affects the implementation.

## Workflow

1. Inspect existing service patterns, dependency injection, transaction handling, error style, and naming.
2. Identify the service responsibility and keep API request concerns outside it.
3. Make inputs explicit and validate invariants at the right boundary.
4. Coordinate repositories, external clients, events, and transactions with clear failure behavior.
5. Return domain-level results or typed errors that API layers can map safely.
6. Add or update focused tests through `test-writer` and review test strength with `test-design-review`.

## Checks

- The service has one coherent reason to change.
- Authorization, idempotency, retries, and transaction boundaries are explicit where relevant.
- Low-level formatting, parsing, and transport details are delegated to utilities or API code.
- Errors preserve enough context for callers without leaking sensitive data.
- The implementation follows existing project style before introducing new abstractions.

## Output

Implement the smallest service behavior that satisfies the current use case. Call out any API, schema, or test follow-up that should be handled by a sibling skill.
