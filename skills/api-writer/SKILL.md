---
name: api-writer
description: Write API boundary code for route handlers, controllers, request validation, response shaping, status codes, API errors, authorization hooks, pagination, and endpoint wiring. Use when implementing code for an established API contract — not when evaluating or designing the contract itself (use api-review for that).
---

# API Writer

Use this skill for transport and contract boundary code. API code should translate between the outside world and application services without hiding business workflows.

For Go API handlers or clients, read `../_knowledge/golang/go-engineering.md` when installed or `../../knowledge/golang/go-engineering.md` in this repository. For frontend-facing React API integration, read `../_knowledge/react/react-engineering.md` when response state, loading, errors, or accessibility are part of the task.

## Workflow

1. Inspect existing route/controller style, validation libraries, auth middleware, error mapping, and response conventions.
2. Confirm the API contract with `api-review` when request or response shape changes.
3. Keep business logic in `service-writer` territory and call services from the boundary.
4. Validate input explicitly and map failures to consistent status codes and error bodies.
5. Shape responses intentionally, including pagination, filtering, sorting, and empty states.
6. Add API-level tests through `test-writer` for validation, auth, success, and failure paths.

## Checks

- Auth and permission checks happen before sensitive work.
- Request parsing and response serialization match existing conventions.
- Error responses are stable, useful, and do not leak internals.
- Breaking changes are avoided or clearly versioned.
- Observability includes enough context to debug failed requests.

## Output

Implement the boundary code and state any service, schema, documentation, or contract-test follow-up needed for a complete API change.
