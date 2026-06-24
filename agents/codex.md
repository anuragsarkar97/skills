# Codex Usage

Codex skills are discovered from skill folders that contain `SKILL.md`.

Recommended install location:

```text
~/.codex/skills/<skill-name>/
```

For this repository, copy or symlink individual folders from `skills/` into the Codex skills directory. Keep `SKILL.md` as the source of truth and use `agents/openai.yaml` only for UI-facing metadata.

## Proactive Selection

Use `agent-skill-router` as the selection guide when the engineer asks for coding help without naming a skill. Prefer the narrowest applicable skill and combine skills when a change crosses boundaries, such as schema plus API plus tests.

For implementation work, prefer `micro-agent-orchestrator` to split service, utility, API, and test responsibilities. Use `smriti-shruti` when context is noisy or expensive, and `oppenheimer-simplifier` when the problem needs first-principles reduction before coding.

Use `critical-thinking` before agreeing to a design that looks unsafe, speculative, overbuilt, or inconsistent with the codebase. Codex should say no when the request is an anti-pattern, then propose a smaller safer alternative.

Use `product-competitive-thinking` before product-facing work. Evaluate the target user, product bet, competitor alternatives, differentiation, MVP scope, and learning metric before implementing.

## Metadata

Use `agents/openai.yaml` for:

- `display_name`
- `short_description`
- `default_prompt`
- `policy.allow_implicit_invocation`

Do not duplicate long instructions in agent metadata. Put operational guidance in `SKILL.md` or a referenced file.
