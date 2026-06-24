# Repository Instructions For AI Agents

This repository stores reusable AI agent skills.

## Rules

- Treat `skills/<skill-name>/SKILL.md` as the canonical instruction file.
- Keep skill frontmatter limited to `name` and `description`.
- Ensure the frontmatter `name` matches the skill directory.
- Put agent-specific metadata in `skills/<skill-name>/agents/`.
- Put large supporting details in `references/` and load them only when needed.
- Validate changes with `npm test` after editing skills.

## Editing Guidance

- Prefer small, focused skills over broad instruction dumps.
- Do not duplicate long operational guidance across agent-specific files.
- Keep scripts deterministic and test representative script behavior before committing them.
