---
name: change-grill-review
description: Perform an adversarial, high-pressure review of code changes, diffs, pull requests, migrations, tests, or implementation plans. Use when an AI agent should challenge assumptions, expose hidden production risks, find edge cases, and push beyond a normal code review.
---

# Change Grill Review

Use this skill when a normal code review would be too lenient — high-stakes production changes, irreversible migrations, security boundaries, or any change where the cost of failure is asymmetric. If `code-review` is sufficient, use that instead. Be direct, specific, and evidence-based. The goal is to find what will fail, not to be agreeable.

When the risk area is clear, load the matching shared reference from `../_knowledge/`: architecture, API, database, product, security, or testing. In this repository, use `../../knowledge/` instead.

## Workflow

1. Reconstruct the intended behavior from the diff, issue, or plan.
2. Identify the riskiest execution paths: production data, concurrency, auth, permissions, migrations, retries, rollbacks, edge inputs, and external dependencies.
3. Look for assumptions the implementation makes but never proves.
4. Attack tests for false confidence, missing assertions, over-mocking, and ignored failure modes.
5. Distinguish blocking issues from hard questions and follow-up improvements.

## Grill Questions

- What breaks if this runs twice, runs late, or partially succeeds?
- What happens under stale data, missing data, malformed input, or high volume?
- Who can access this path, and what prevents privilege escalation?
- What behavior changed for existing users or API consumers?
- What rollback or recovery path exists if this ships broken?
- Which test would fail if the main assumption is wrong?

## Output

Lead with the hardest findings. Use severity labels when useful. Avoid softening real risks, but do not invent problems without evidence.
