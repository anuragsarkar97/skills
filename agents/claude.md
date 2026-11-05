# Claude Usage

Keep `SKILL.md` canonical and agent metadata concise. Install using the repository CLI and the target supported by your host; see the README for commands.

## Skill Selection

Use `agent-skill-router` to select a specialized workflow when it adds value. It is a selector, not a mandatory chain of skills. Straightforward implementation can proceed without another skill.

Use the matching shared stack reference only when Go, React, Python, Kubernetes, AWS, or Azure details affect the task. Load deeper domain guidance for a concrete question; do not pre-read the catalog or generate a repository map for every edit.

Follow existing user authorization through the complete requested workflow. Ask when required information or an action boundary is unresolved, not because a skill describes the next step. Do not send messages, publish, deploy, or modify production data without authorization.

## Metadata and Compatibility

- Frontmatter contains only `name` and `description`; the name matches the directory.
- OpenAI UI metadata and invocation policy live in `agents/openai.yaml`.
- Claude-specific notes live in `agents/claude.md` within the relevant skill.
- Shared references install as `_knowledge/` next to skill directories. In this repository they live under `knowledge/`.
- Do not encode model names, private tools, or host-only APIs in portable workflows.
