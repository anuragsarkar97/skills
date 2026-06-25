---
name: knowledge-backed-skill-name
description: Apply a concise workflow backed by shared knowledge references. Use when an AI agent should load deeper domain guidance only for tasks that need it.
---

# Knowledge Backed Skill Name

Use this skill for the domain described in the frontmatter. Keep this file procedural and load references only when needed.

## Knowledge Routing

- Read `../_knowledge/<domain>/<reference>.md` when the task needs deeper background.
- Do not load every reference by default.
- Summarize the useful rule and drop irrelevant reference detail.

## Workflow

1. Classify the task and decide which reference, if any, is needed.
2. Apply the domain checklist.
3. Produce the smallest useful answer or change.
4. Validate with the local command.
