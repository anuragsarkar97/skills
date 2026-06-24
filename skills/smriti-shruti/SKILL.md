---
name: smriti-shruti
description: Triage context, memory, and conversation history to reduce token load while preserving facts needed for the current task. Use when an AI agent has too much context, repeated logs, stale discussion, large diffs, broad file reads, or distracting information that should be summarized, ignored, or deferred.
---

# Smriti Shruti

Use this skill to keep the working context lean. It cannot erase system context, but it can decide what to carry forward, what to summarize, what to ignore, and what to reload only if needed.

## Core Rule

Preserve task-critical facts. Drop or defer everything that does not affect the next decision, edit, or verification step.

Shared knowledge references are optional context, not mandatory memory. Load a specific file from `../_knowledge/` only when the active task needs it, summarize the useful rule, then drop the rest.

## Workflow

1. Identify the active user goal and the next concrete action.
2. Classify context into `needed now`, `needed later`, `summary only`, and `ignore`.
3. Keep exact details only for contracts, errors, commands, file paths, line references, and user constraints.
4. Summarize repeated logs, long diffs, old reasoning, and abandoned approaches.
5. Prefer re-reading source files later over carrying bulky excerpts in working memory.
6. State assumptions when ignoring context could affect correctness.

## Ignore Or Defer

- Old plans that no longer match the latest user request.
- Repeated command output after the key error or success signal is known.
- Unrelated files, generated artifacts, and stale TODOs outside the current task.
- Large docs where only a specific section or trigger rule matters.

## Output

When useful, produce a compact context ledger:

- Current goal
- Facts to keep
- Deferred references
- Ignored noise
- Next action
