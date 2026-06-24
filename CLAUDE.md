# Claude Instructions

This repository contains portable skills for AI agents. Use `skills/<skill-name>/SKILL.md` as the source of truth for each skill.

## Working In This Repository

- Validate skill changes with `npm test`.
- Keep shared instructions in `SKILL.md`.
- Use `agents/claude.md` inside a skill only for Claude-specific notes.
- Do not add bulky documentation to `SKILL.md`; place it in `references/` and mention when it should be read.
- Preserve compatibility with Codex/OpenAI metadata by keeping `agents/openai.yaml` concise.
