# Claude Usage

Claude-oriented skills should keep `SKILL.md` as the canonical instruction file so the same skill can be reused by other agents.

Recommended install options vary by Claude surface and local setup. Use this repository as the source, then copy or symlink the needed skill folders into the Claude skills location configured for that environment.

## Compatibility Notes

- Keep frontmatter minimal: `name` and `description`.
- Put detailed procedures in the Markdown body.
- Put large supporting material in `references/`.
- Use `agents/claude.md` inside a skill only when Claude needs agent-specific notes that should not affect other agents.
- Use `agent-skill-router` as the default selection guide when a user asks for engineering work without naming a skill.
- Prefer narrow specialized skills and combine them when a change crosses API, schema, test, documentation, naming, or design boundaries.
