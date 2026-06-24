---
name: test-design-review
description: Design tests and stress-review test suites for correctness, coverage, reliability, and signal quality. Use when an AI agent creates tests, reviews test changes, diagnoses flaky tests, evaluates mocks, or checks whether behavior is actually protected.
---

# Test Design Review

Use this skill whenever behavior changes need protection or existing tests need a hard look. A good test should fail for the right reason when the behavior breaks.

For deeper test-level selection and coverage guidance, read `../_knowledge/testing/testing-strategy.md` when installed or `../../knowledge/testing/testing-strategy.md` in this repository.

## Workflow

1. Identify the behavior, invariant, or contract under test.
2. Choose the cheapest test level that catches the risk: unit, integration, contract, end-to-end, property, migration, or smoke.
3. Cover the main success path, meaningful edge cases, and expected failures.
4. Minimize mocks around the code path being verified. Mock boundaries, not the behavior being claimed.
5. Check determinism: time, randomness, network, order, concurrency, and shared state.

## Grill The Tests

- Would this test fail if the production bug happened?
- Is it asserting outcomes or merely exercising code?
- Are mocks reproducing implementation details instead of real contracts?
- Are important cases missing because they are inconvenient to set up?
- Could the test pass when the feature is broken?
- Could the test fail intermittently for unrelated reasons?

## Output

For test design, list the exact cases to add and why each matters. For review, lead with false confidence and missing coverage before naming style.
