---
name: decision-memory
description: Capture, search, and reuse repository decisions, rejected alternatives, constraints, and supporting evidence. Use when an AI agent records an architecture or engineering decision, checks prior rationale before proposing a change, or identifies a superseded decision.
---

# Decision Memory

Preserve why a repository works the way it does. Treat decision records as evidence, not unquestionable policy: verify that a decision still applies to the current code and constraints.

Use `scripts/decision-memory.mjs`. Records default to `.skill-context/decisions.jsonl` in the target repository. Pass `--path <repository>` or `--file <path>` when needed.

## Workflow

1. Search existing decisions before proposing architecture, persistence, API, security, or operational changes.
2. Record a decision only after the user or repository evidence establishes it. Never infer organizational policy from code alone.
3. Capture context, the decision, rationale, rejected alternatives, constraints, and evidence.
4. Use `proposed` for undecided options and `accepted` for explicit decisions.
5. Supersede rather than rewriting history: add a new accepted record with `--supersedes <id>`.
6. Verify relevant decisions against current source before implementation.

## Commands

```bash
node scripts/decision-memory.mjs init --path .
node scripts/decision-memory.mjs add --path . \
  --title "Do not retry payment creation" \
  --decision "Payment creation is never retried automatically" \
  --rationale "Retries can create duplicate charges" \
  --alternative "Generic HTTP retry middleware" \
  --evidence "INC-142" \
  --tag payments
node scripts/decision-memory.mjs search --path . --query "payment retry"
node scripts/decision-memory.mjs list --path . --status accepted
```

Repeat `--alternative`, `--evidence`, and `--tag` for multiple values.

## Guardrails

- Do not store secrets, credentials, private conversations, or regulated personal data.
- Distinguish facts, explicit decisions, and proposals.
- Do not present a stale or superseded decision as current.
- Do not use commit messages alone as proof of rationale or approval.
- Keep records concise enough to scan before a change.

## Output

Report matching decision IDs, status, date, title, rationale, supersession state, and evidence. When recording, report the ledger path and new ID.
