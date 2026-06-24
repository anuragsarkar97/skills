# Testing Strategy Knowledge

Use this reference when designing or reviewing tests, deciding coverage depth, or checking whether a change has enough validation.

## Test Selection

- Unit tests: pure functions, validators, mappers, branching logic, and edge cases.
- Service tests: business workflows, permissions, transactions, idempotency, and failure handling.
- API tests: request validation, auth, status codes, response shape, compatibility, and error contracts.
- Integration tests: database queries, migrations, queues, third-party adapters, and serialization boundaries.
- Regression tests: any bug fix where a specific input previously failed.

## Quality Bar

- Tests should fail for the bug or risk they claim to cover.
- Prefer assertions on externally visible behavior over implementation shape.
- Cover negative paths for permissions, validation, missing resources, and duplicate requests.
- Avoid brittle snapshots unless the output is intentionally a stable contract.
- Do not add broad slow tests when a focused lower-level test proves the risk.

## Contract Testing

Use contract testing at service boundaries where two services communicate via HTTP or messaging queues, and deploying both together for an integration test is expensive or brittle.

**Consumer-driven contract testing** (Pact model):
1. The consumer writes tests against the exact requests it sends and responses it expects — a contract file is generated automatically.
2. The contract is shared with the provider.
3. The provider verifies it can satisfy the contract in isolation — no consumer deployment needed.

Key advantage: only behavior *actually consumed* is tested. Unused provider behavior can evolve freely without breaking downstream consumers.

**When to use**: microservice API boundaries, shared internal libraries with multiple consumers, event schemas used across services.

**When not to use**: a monolith where both sides deploy together, or when a full integration test is fast and reliable. Contract testing solves a coordination and speed problem — don't add it where the problem doesn't exist.

## Source Notes

- The test pyramid is commonly described by Martin Fowler: https://martinfowler.com/bliki/TestPyramid.html
- Google testing guidance discusses test size, scope, and maintainability: https://testing.googleblog.com/
- Playwright documentation is a practical reference for browser workflow testing: https://playwright.dev/docs/intro
- Pact consumer-driven contract testing: https://docs.pact.io/
