---
name: code-review
description: "Review code, API contracts, and tests for concrete bugs, compatibility failures, and false confidence. Use for diffs, PRs, proposed contracts, or dedicated test reviews."
---

# Code Review

Lead with findings ordered by severity. Focus on concrete bugs, regressions, security issues, broken assumptions, missing tests, and maintainability risks that affect behavior.

When a review touches a specialized risk area, load only the matching shared reference from `../_knowledge/`: architecture, API, database, security, product, testing, Go, React, Python scripting, Kubernetes, or AWS/Azure cloud architecture. In this repository, use `../../knowledge/` instead.

## Workflow

1. Inspect the changed files and nearby code before forming conclusions.
2. Check whether the change preserves public contracts, data migrations, error handling, accessibility, security boundaries, and performance expectations relevant to the touched area.
3. Verify test coverage for the changed behavior. Treat missing tests as a finding when risk is meaningful.
4. Check whether changed behavior leaves stale documentation and whether new abstractions have a concrete caller or proven need. Use the architecture reference for disputed boundaries.
5. Keep summaries secondary to findings.

## API and Test Review

For contract reviews, read `../_knowledge/api/api-review.md` when installed or `../../knowledge/api/api-review.md` in this repository. Check consumers, compatibility, auth, request/response schemas, pagination, idempotency, and errors. Flag concrete breaking requests or responses rather than implementation style.

For test adequacy, read `../_knowledge/testing/testing-strategy.md` when installed or `../../knowledge/testing/testing-strategy.md` in this repository. Check that assertions fail for the intended defect, mocks do not replace the behavior being claimed, meaningful failures are covered, and time/network/shared state cannot make tests flaky. Recommend the smallest test that proves the risk.

## Adversarial Mode

Use adversarial mode when the user asks to be grilled or the change touches irreversible migrations, production data, security boundaries, concurrency, retries, rollbacks, or costly external dependencies.

1. Reconstruct the intended behavior and identify assumptions the change never proves.
2. Attack partial success, duplicate execution, stale or malformed data, high volume, privilege escalation, compatibility, and recovery paths.
3. Challenge tests for false confidence, missing assertions, over-mocking, and ignored failure modes.
4. Distinguish evidence-backed blockers from hard questions. Be direct without inventing hypothetical findings.

Ask:

- What breaks if this runs twice, runs late, or partially succeeds?
- Who can access this path, and what prevents privilege escalation?
- What behavior changed for existing users or consumers?
- What rollback or recovery path exists?
- Which test fails if the central assumption is wrong?

## Severity Tiers

Label each finding with one of these tiers:

- **Blocking**: must be fixed before merging — correctness bugs, security issues, broken contracts, data loss risks.
- **Significant**: should be addressed soon — meaningful regressions, missing test coverage on risky paths, performance cliffs.
- **Minor**: optional improvements — style divergence, naming inconsistency, defensive code that adds noise.

Label severity explicitly; uncertainty alone does not make a finding blocking.

Check changed public names for domain consistency, units, and compatibility. Avoid cosmetic renames without a concrete clarity or correctness benefit.

## What Not to Flag

Avoid flagging:
- Style choices already consistent with the surrounding codebase.
- Hypothetical future requirements not present in the diff.
- Defensive error handling for scenarios the framework or type system already prevents.
- Code the author clearly intends to refactor separately (unless it creates an immediate risk).

## Completion Check

Before finishing, verify every finding has a concrete failure path and file reference, severity reflects impact, tests were considered, and no summary appears before findings. If no findings remain, say that directly and name residual risk or untested areas.

## Output

Use this order:

1. Findings with file and line references and severity tier.
2. Open questions or assumptions.
3. Brief change summary only after findings.
4. Tests reviewed or still missing.

If there are no findings, say so directly and mention remaining test gaps or residual risk.
