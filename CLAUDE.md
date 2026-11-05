# Claude Instructions

This repository contains portable skills for AI agents. Use `skills/<skill-name>/SKILL.md` as the source of truth for each skill.

## Working In This Repository

- Validate skill changes with `npm test`.
- Keep shared instructions in `SKILL.md`.
- Use `agents/claude.md` inside a skill only for Claude-specific notes.
- Do not add bulky documentation to `SKILL.md`; place it in `references/` and mention when it should be read.
- Preserve compatibility with Codex/OpenAI metadata by keeping `agents/openai.yaml` concise.
- For cross-cutting agent behavior, use `knowledge/agent-behavior/operating-principles.md` instead of duplicating broad system-prompt guidance across skills.

## Skill Selection

Use `skills/agent-skill-router/SKILL.md` to select a specialized workflow when it adds value. It is a selector, not a mandatory chain of skills. Straightforward implementation can proceed without another skill.

Use the matching shared stack reference only when Go, React, Python, Kubernetes, AWS, or Azure details affect the task. Load deeper domain guidance for a concrete question; do not pre-read the catalog or generate a repository map for every edit.

Follow existing user authorization through the complete requested workflow. Ask when required information or an action boundary is unresolved, not because a skill describes the next step. Do not send messages, publish, deploy, or modify production data without authorization.

## Verification

Run `npm test` after editing skills. Regenerate catalog and graph artifacts when inventory, metadata, or routing changes.
