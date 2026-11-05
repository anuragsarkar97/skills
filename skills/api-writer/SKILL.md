---
name: api-writer
description: "Implement route handlers and controllers for an established API contract, including input validation, authorization, error mapping, and response serialization."
---

# API Writer

Use this skill for transport and contract boundary code. API code should translate between the outside world and application services without hiding business workflows.

For Go API handlers or clients, read `../_knowledge/golang/go-engineering.md` when installed or `../../knowledge/golang/go-engineering.md` in this repository. For frontend-facing React API integration, read `../_knowledge/react/react-engineering.md` when response state, loading, errors, or accessibility are part of the task.

## Workflow

1. Inspect existing route/controller style, validation libraries, auth middleware, error mapping, and response conventions.
2. Inspect the established contract; use `api-review` when compatibility or contract semantics need review.
3. Follow existing ownership: keep transport details at the boundary without introducing a new service layer just for this change.
4. Validate input explicitly and map failures to consistent status codes and error bodies.
5. Shape responses intentionally, including pagination, filtering, sorting, and empty states.
6. Test validation, auth, success, and meaningful failure paths using the existing API test harness.

## Checks

- Auth and permission checks happen before sensitive work.
- Request parsing and response serialization match existing conventions.
- Error responses are stable, useful, and do not leak internals.
- Breaking changes are avoided or clearly versioned.
- Observability includes enough context to debug failed requests.

## Completion Check

Before finishing, verify request validation, auth behavior, response shape, status codes, error mapping, and API tests match the established contract. If the contract changed, confirm `api-review` was applied or name the remaining review gap.

## Output

Implement the boundary code and state any service, schema, documentation, or contract-test follow-up needed for a complete API change.
