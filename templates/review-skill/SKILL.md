---
name: review-skill-name
description: Review a specific kind of change for concrete risks, regressions, missing tests, and production impact. Use when an AI agent must evaluate this domain before merge or release.
---

# Review Skill Name

Use this skill to review changes in this domain. Lead with findings and evidence, not summaries.

## Workflow

1. Identify the intended behavior and the contract being changed.
2. Inspect the changed files and nearby patterns.
3. Check correctness, compatibility, security, data integrity, observability, and tests.
4. Separate blocking issues from follow-up improvements.

## Output

1. Findings ordered by severity.
2. Open questions or assumptions.
3. Tests reviewed or missing.
