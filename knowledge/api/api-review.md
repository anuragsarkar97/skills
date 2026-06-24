# API Review Knowledge

Use this reference for endpoint design, request and response contracts, compatibility, auth behavior, pagination, idempotency, and API error semantics.

## Review Checklist

- Contract: stable field names, explicit required versus optional fields, no ambiguous booleans, no leaking internal persistence names unless they are domain terms.
- Auth: every endpoint has a principal model, permission boundary, tenant/workspace boundary, and failure behavior.
- Compatibility: additive changes are preferred; removals and semantic changes require versioning, migration, or clear rollout.
- Errors: return machine-readable codes, human-readable messages, trace/request IDs when available, and consistent status codes.
- Pagination: list endpoints need deterministic ordering, cursor or page semantics, limits, and filtering rules.
- Idempotency: create, retry, webhook, payment, and job-triggering endpoints need duplicate handling.
- Observability: log request identity, actor, target resource, decision outcome, and safe error context.

## Strong No Conditions

- Public API behavior depends on hidden client timing or ordering assumptions.
- Auth is deferred because "the frontend will hide it."
- Endpoint returns different shapes for the same status without a versioned contract.
- Writes are not idempotent where clients or webhooks can retry.

## Source Notes

- HTTP semantics and status code behavior are defined by RFC 9110: https://www.rfc-editor.org/rfc/rfc9110
- JSON:API documents consistent error object and pagination patterns: https://jsonapi.org/format/
- Stripe documents practical idempotency-key behavior for retryable writes: https://docs.stripe.com/api/idempotent_requests
