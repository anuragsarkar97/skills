# Harness Engineering

Use for reproducible coding-agent environments and evidence-based improvements. Reviewed 2026-11-05. The design rules below are repository recommendations; vendor experiments are examples, not universal performance guarantees.

## Environment Contract

Record repository revision, model/configuration, runtime and tool versions, setup commands, disposable data, permitted network access, artifact paths, and completion commands. A missing dependency or flaky service is not automatically a model reasoning failure.

Expose the application and evidence the task actually needs: a runnable local instance, UI state, logs, traces, tests, or query plans. Keep instructions as navigation to maintained sources. Prefer a local executable check for a stable boundary over a paragraph that asks the agent to remember it.

Separate durable session events and artifacts from ephemeral compute where recovery requires it. Resume from verified state: inspect the checkout, pending operations, and last successful check rather than trusting a narrative handoff alone. A simple local task does not need a hosted harness or event-sourcing platform.

## Evaluation Contract

A useful case identifies input, initial environment, allowed actions, expected observable outcome, forbidden side effects, budget, and grader. Start with real failures plus ordinary successful tasks so a fix does not merely trade one failure class for another.

Use deterministic assertions on resulting state where possible. Calibrate model judges against human-labeled examples for subjective quality. Do not use the agent's own completion claim as the grader. Protect fixtures and expected outputs from agent modification; keep held-out cases separate from prompt-tuning cases.

Report per-task results and repeated-run variability. Distinguish at-least-one success among several attempts from consistently succeeding across attempts. Include invalid trials and infrastructure failures explicitly instead of silently dropping them. Compare baseline and candidate under matched model, environment, permissions, and budgets.

Useful measurements include task completion, unauthorized action attempts, regressions, tool failures, repair loops, elapsed time, token/tool cost, and human intervention. A static skill catalog test checks packaging and references; it does not measure agent success.

## Failure Experiments

Choose cases relevant to the actual harness:

- Start in a clean workspace with no warm local state; verify setup and smoke checks.
- Lose transient context or restart compute; confirm completed artifacts and pending actions survive correctly.
- Return a tool timeout, truncated output, or malformed result; confirm bounded recovery and an honest terminal status.
- Let a requested outcome remain broken while tests pass; verify the grader checks user behavior rather than an easy proxy.
- Change the model while keeping the environment fixed; check whether old reminders or forced resets still help.

Do not add unlimited critic loops, automatic merges, or broad tool access solely because a published experiment used them. Completion evidence and action authorization are separate concerns.

## Source Notes

- OpenAI, 2026-02-11, describes repository knowledge, isolated runnable applications, telemetry, and mechanical feedback in an agent-first project: https://openai.com/index/harness-engineering/
- Anthropic, 2026-03-24, reports planner/generator/evaluator experiments and structured context handoffs for long application builds; this is one tested architecture, not a default requirement: https://www.anthropic.com/research/harness-design-long-running-apps
- Anthropic, 2026-01-09, explains tasks, trials, graders, outcome evaluation, and repeated-trial reliability: https://www.anthropic.com/research/demystifying-evals-for-ai-agents
- Anthropic, 2026-04-08, separates sessions, harnesses, and sandboxes and describes removing model-specific workarounds that became unnecessary: https://www.anthropic.com/research/managed-agents
