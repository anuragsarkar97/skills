---
name: test-writer
description: Write targeted tests for changed behavior across unit, integration, API, service, utility, contract, migration, and regression scenarios. Use when an AI agent implements tests, adds missing coverage, encodes a bug reproduction, or verifies service, utility, and API writer changes.
---

# Test Writer

Use this skill to add tests that protect real behavior. Tests should be scoped, deterministic, and capable of failing for the defect they are meant to catch.

## Workflow

1. Identify the behavior, bug, contract, or invariant the test must protect.
2. Inspect local test style, fixtures, factories, mocks, naming, and commands.
3. Choose the lowest test level that catches the risk without hiding integration behavior.
4. Arrange data clearly, act once, and assert externally visible outcomes.
5. Cover important failure paths, not only the happy path.
6. Run the narrowest meaningful test command and report what was run.

## Test Types

- Service tests verify business behavior, transactions, permissions, and collaborator effects.
- Utility tests are table-driven when inputs, formats, or edge cases vary.
- API tests verify request validation, auth, status codes, response bodies, and error mapping.
- Regression tests start by failing against the original bug when feasible.

## Checks

- The test would fail if the target behavior broke.
- Mocks are used for boundaries, not for the behavior being claimed.
- Time, randomness, ordering, network, and shared state are controlled.
- Assertions are specific enough to catch the intended failure.

## Output

Add the smallest useful test set and state any remaining coverage gaps. Use `test-design-review` when test adequacy is uncertain.
