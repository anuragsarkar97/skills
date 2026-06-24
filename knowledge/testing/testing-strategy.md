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

## Source Notes

- The test pyramid is commonly described by Martin Fowler: https://martinfowler.com/bliki/TestPyramid.html
- Google testing guidance discusses test size, scope, and maintainability: https://testing.googleblog.com/
- Playwright documentation is a practical reference for browser workflow testing: https://playwright.dev/docs/intro
