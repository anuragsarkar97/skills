# Claude Usage

Claude-oriented skills should keep `SKILL.md` as the canonical instruction file so the same skill can be reused by other agents.

Recommended install options vary by Claude surface and local setup. Use this repository as the source, then copy or symlink the needed skill folders into the Claude skills location configured for that environment.

## Compatibility Notes

- Keep frontmatter minimal: `name` and `description`.
- Put detailed procedures in the Markdown body.
- Put large supporting material in `references/`.
- Use `agents/claude.md` inside a skill only when Claude needs agent-specific notes that should not affect other agents.
