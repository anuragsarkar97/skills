---
name: service-writer
description: "Implement business workflows with transaction, permission, retry, and external side-effect boundaries. Use for application orchestration that needs explicit failure handling."
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
6. Add focused tests for changed behavior and meaningful failures. Use `test-design-review` only when coverage adequacy is uncertain.

## Checks

- The service has one coherent reason to change.
- Authorization, idempotency, retries, and transaction boundaries are explicit where relevant.
- Low-level formatting, parsing, and transport details are delegated to utilities or API code.
- Errors preserve enough context for callers without leaking sensitive data.
- The implementation follows existing project style before introducing new abstractions.

## Completion Check

Before finishing, verify the service behavior matches the requested workflow, callers receive domain-level results or errors, transaction and permission boundaries are covered where relevant, focused tests were added or a gap is named, and the validation command result is reported.

## Output

Implement the smallest service behavior that satisfies the current use case. Finish affected callers, API wiring, schema changes, and tests within the authorized task. Name any remaining blocker.
