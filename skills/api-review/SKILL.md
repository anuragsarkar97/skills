---
name: api-review
description: Review API contracts and behavior for REST, RPC, GraphQL, webhooks, SDK methods, and internal service boundaries. Use when an AI agent creates, changes, or evaluates endpoints, request and response shapes, status codes, auth, errors, pagination, compatibility, or versioning.
---

# API Review

Use this skill when an interface between clients, services, or teams changes. Review the contract, not just the handler implementation.

For deeper contract guidance, read `../_knowledge/api/api-review.md` when installed or `../../knowledge/api/api-review.md` in this repository. If the API touches auth, permissions, secrets, PII, webhooks, uploads, or tenant isolation, also read `../_knowledge/security/security-review.md`.

## Workflow

1. Identify consumers, producers, versioning expectations, and compatibility constraints.
2. Inspect existing API style for naming, auth, error shape, pagination, filtering, and status codes.
3. Validate request and response schemas, required fields, defaults, and unknown-field behavior.
4. Check authorization, authentication, rate limits, idempotency, retries, and side effects.
5. Review observability: logs, metrics, traces, request IDs, and actionable error responses.
6. Verify tests cover success, validation errors, auth failures, missing resources, and backward compatibility.

## Contract Checks

- Resource names, verbs, and field names match domain language.
- Status codes and error bodies are predictable and documented.
- List endpoints define pagination, sorting, filtering, limits, and stable ordering.
- Mutating endpoints define idempotency, conflict handling, and partial failure behavior.
- Breaking changes are avoided or explicitly versioned with migration guidance.

## Output

Lead with contract and compatibility risks. Include concrete examples of problematic requests or responses when useful.
