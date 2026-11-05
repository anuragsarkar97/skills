---
name: commit-pr-writer
description: "Draft commit messages, PR descriptions, or release notes from verified diffs and test results. Use when delivery text is requested; do not commit or publish implicitly."
---

# Commit PR Writer

Use this skill when preparing commit or PR text. Inspect the diff first; do not invent scope, tests, or risk claims.

## Workflow

1. Inspect staged changes for commit messages, or the full branch diff for PR text.
2. Derive the intent from behavior changed, not file names alone.
3. Match the project style when commit history or PR templates exist.
4. Separate what changed, why it changed, risk, and verification.
5. Keep text concrete enough that a reviewer can decide where to focus.

## Commit Message

Prefer this shape unless the repository has a stronger convention:

```text
type(scope): concise imperative summary
```

Use `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, or the local convention. Avoid vague summaries like `update code`, `fix issues`, or `changes`.

## PR Text

Match the repository template. For small changes, a short behavior summary and verified test result are enough; add rollout and risk sections when they affect review.

State when tests were not run. Do not claim validation that did not happen.
