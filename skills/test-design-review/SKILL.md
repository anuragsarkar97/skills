---
name: test-design-review
description: "Review test adequacy, false confidence, mocks, flakiness, and missing risk coverage. Use when test strategy is uncertain or a test review is requested, rather than every test edit."
---

# Test Design Review

Use this skill when test adequacy needs a dedicated review. A good test should fail for the right reason when the behavior breaks.

For deeper test-level selection and coverage guidance, read `../_knowledge/testing/testing-strategy.md` when installed or `../../knowledge/testing/testing-strategy.md` in this repository.

For Go, React, or Python script tests, also read the matching shared stack reference from `../_knowledge/` so test strategy follows local ecosystem conventions.

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

## Completion Check

Before finishing, verify the recommendation ties each test case to a behavior or risk, distinguishes blocking coverage gaps from nice-to-have cases, identifies flaky or false-confidence patterns, and names the validation command or test level that should prove the fix.

## Output

For test design, list the exact cases to add and why each matters. For review, lead with false confidence and missing coverage before naming style.
