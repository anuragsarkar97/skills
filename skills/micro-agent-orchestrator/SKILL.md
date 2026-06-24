---
name: micro-agent-orchestrator
description: Coordinate focused implementation skills for writing service code, utility code, API handlers, and tests. Use when an AI agent needs to split implementation work into small specialized passes, choose the right writer skill, or keep code changes scoped across layers.
---

# Micro Agent Orchestrator

Use this skill when implementation work spans multiple layers or would benefit from focused passes. Select the smallest useful writer skill instead of letting one broad pass touch everything.

For Go, React, Python scripting, Kubernetes, AWS, or Azure work, load the matching shared knowledge reference before splitting the work so the selected writer and review skills inherit stack-specific constraints.

## Routing

- Use `service-writer` for business logic, application services, orchestration, transactions, and domain workflows.
- Use `utility-writer` for pure helpers, adapters, formatters, parsers, validators, and reusable functions.
- Use `api-writer` for controllers, route handlers, request validation, response shaping, API errors, and endpoint wiring.
- Use `test-writer` for targeted tests after behavior is implemented or while driving the implementation.
- Use `smriti-shruti` first when the context is large, noisy, or likely to distract the implementation.
- Use `oppenheimer-simplifier` first when the problem is complex, vague, or blocked by too many moving parts.

## Workflow

1. Identify the behavior being implemented and the layer that owns it.
2. Split work by responsibility: API boundary, service behavior, utility extraction, and tests.
3. Invoke only the relevant writer skills for the current slice.
4. Keep boundaries explicit: API code should not hide business rules, utilities should not own workflows, and tests should verify behavior instead of implementation trivia.
5. After writing, use `test-design-review` for coverage quality and `code-review` or `change-grill-review` for risk review.

## Output

State the selected writer skills and the implementation order when it helps coordination. Keep the actual code change small enough that each layer can be reviewed independently.
