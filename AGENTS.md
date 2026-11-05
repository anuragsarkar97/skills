# Repository Instructions For AI Agents

This repository stores reusable AI agent skills.

## Rules

- Treat `skills/<skill-name>/SKILL.md` as the canonical instruction file.
- Keep skill frontmatter limited to `name` and `description`.
- Ensure the frontmatter `name` matches the skill directory.
- Put agent-specific metadata in `skills/<skill-name>/agents/`.
- Put large supporting details in `references/` and load them only when needed.
- Use `agent-skill-router` proactively when the user asks for engineering work but does not name a skill.
- Validate changes with `npm test` after editing skills.

## Skill Selection

Use `skills/agent-skill-router/SKILL.md` to select a specialized workflow when it adds value. It is a selector, not a mandatory chain of skills. Straightforward implementation can proceed without another skill.

Use the matching shared stack reference only when Go, React, Python, Kubernetes, AWS, or Azure details affect the task. Load deeper domain guidance for a concrete question; do not pre-read the catalog or generate a repository map for every edit.

Follow existing user authorization through the complete requested workflow. Ask when required information or an action boundary is unresolved, not because a skill describes the next step. Do not send messages, publish, deploy, or modify production data without authorization.

## Editing Guidance

- Prefer small, focused skills over broad instruction dumps.
- Do not duplicate long operational guidance across agent-specific files.
- Keep scripts deterministic and test representative script behavior before committing them.
- Run `npm run skills:catalog` after adding, removing, or materially changing skill metadata.
- Run `npm run skills:audit`, `npm run skills:examples`, and `npm run skills:graph` after changing routing, triggers, or metadata.
- Prefer `npm run skills:check` before finishing any skill-system change.
