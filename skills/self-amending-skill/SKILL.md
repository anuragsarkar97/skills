---
name: self-amending-skill
description: Improve this skills repository when real usage reveals missing triggers, stale guidance, weak routing, duplicated instructions, validation gaps, or inefficient workflows. Use when an AI agent notices a skill should be updated, split, merged, tightened, or connected to scripts based on concrete task evidence.
---

# Self-Amending Skill

Use this skill to maintain the skill system itself. The goal is controlled evolution, not automatic self-modification.

## Guardrails

- Do not silently rewrite skills while using them for an unrelated task.
- Do not change system, developer, or platform instructions.
- Do not broaden a skill because of one weak signal; look for a concrete failure, repeated friction, or a clear missing trigger.
- Keep edits small and reviewable.
- Preserve user changes and inspect `git status` before editing.
- Validate with `npm test` after skill changes.
- Prefer `npm run skills:check` before finishing skill-system work.
- Run `npm run skills:audit` after routing, metadata, or quality changes.
- Run `npm run skills:examples` when trigger behavior changes.

## Workflow

1. Capture the evidence: the task, confusion, missed trigger, bad output, duplicate guidance, or validation gap.
2. Decide the amendment type: update description trigger, tighten workflow, add routing, add validation, split skill, merge overlap, or add supporting script.
3. Edit the smallest responsible file: usually `SKILL.md`, `agents/openai.yaml`, `agents/claude.md`, `agent-skill-router`, or validation scripts.
4. Run `npm test`.
5. Run `npm run skills:audit` for metadata, routing, and catalog checks.
6. Regenerate the catalog with `npm run skills:catalog` when skill inventory or metadata changed.
7. Regenerate the graph with `npm run skills:graph` when skill references or routing changed.
8. Summarize what changed and why.

## When To Say No

Reject self-amendment when the requested change would:

- Make a skill vague or all-purpose.
- Add bulky docs that should be references.
- Encode one user's temporary preference as a general rule.
- Conflict with existing repository conventions.
- Weaken safeguards around sending messages, committing code, external network use, or production systems.

## Output

Provide a concise amendment note:

- Evidence
- Change made
- Files changed
- Validation, audit, catalog, and graph results
- Follow-up, if any
