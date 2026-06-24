---
name: code-review
description: Perform rigorous code reviews for proposed changes, pull requests, diffs, or local worktrees. Use when an AI agent is asked to review code, identify bugs, assess regressions, evaluate test coverage, or summarize implementation risk.
---

# Code Review

Lead with findings ordered by severity. Focus on concrete bugs, regressions, security issues, broken assumptions, missing tests, and maintainability risks that affect behavior.

When a review touches a specialized risk area, load only the matching shared reference from `../_knowledge/`: architecture, API, database, security, product, or testing. In this repository, use `../../knowledge/` instead.

## Workflow

1. Inspect the changed files and nearby code before forming conclusions.
2. Check whether the change preserves public contracts, data migrations, error handling, accessibility, security boundaries, and performance expectations relevant to the touched area.
3. Verify test coverage for the changed behavior. Treat missing tests as a finding when risk is meaningful.
4. Keep summaries secondary to findings.

## Output

Use this order:

1. Findings with file and line references.
2. Open questions or assumptions.
3. Brief change summary only after findings.
4. Tests reviewed or still missing.

If there are no findings, say so directly and mention remaining test gaps or residual risk.
