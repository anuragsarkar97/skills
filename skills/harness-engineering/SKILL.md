---
name: harness-engineering
description: Design and improve coding-agent environments, feedback loops, and evaluation harnesses. Use for reproducibility, task verification, context handoffs, or measured agent reliability.
---

# Harness Engineering

Improve the system around an agent: what it can inspect, execute, persist, and verify. Start from a reproduced failure or an acceptance task, not a longer prompt.

For evaluation design, environment contracts, and current source notes, read `../_knowledge/agents/harness-engineering.md` when installed or `../../knowledge/agents/harness-engineering.md` in this repository. Load only the section needed.

## Workflow

- Define observable completion, permitted side effects, and an independent success check. Distinguish a working artifact from a persuasive final message.
- Inspect the current run path: instructions, tools, repository knowledge, startup commands, fixtures, credentials boundary, and validation. Classify the failure as environment, retrieval/context, tool, model decision, or grader failure.
- Make the smallest missing capability available: reproducible setup, focused docs, structured errors, isolated data, UI inspection, or queryable telemetry. Enforce stable invariants with existing checks rather than repeated prose.
- For long tasks, persist completed work, exact verification results, unresolved issues, and the next action outside transient context. Validate resume in a fresh session; a summary is not a checkpoint of external state.
- Compare the change against a fixed baseline using representative tasks, repeated trials where variation matters, and the same resource budget. Track success, unsafe actions, latency, cost, and human intervention; change one meaningful variable at a time.

## Boundaries

- Keep grader inputs and expected results outside the agent's write scope. Do not let an agent redefine success, edit protected tests, or count skipped checks as passes.
- Use isolated workspaces and disposable fixtures for evaluation. Never benchmark against live customer data or production side effects by default.
- A retry must have new evidence or a bounded recovery strategy. Preserve cancellation, time/cost limits, and required authorization across resumed runs.
- Re-evaluate model-specific workarounds after upgrades; remove scaffolding that no longer improves measured outcomes.

## Completion Check

Deliver the smallest harness change and its acceptance evidence. Include the reproduction task, baseline/candidate configuration, observed results, and limits. If no live model trials ran, label results as structural or deterministic checks rather than a reliability improvement.
