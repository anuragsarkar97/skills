---
name: api-writer
description: Write API boundary code for route handlers, controllers, request validation, response shaping, status codes, API errors, authorization hooks, pagination, and endpoint wiring. Use when an AI agent implements or changes an API surface and needs code that matches an existing contract.
---

# API Writer

Use this skill for transport and contract boundary code. API code should translate between the outside world and application services without hiding business workflows.

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
