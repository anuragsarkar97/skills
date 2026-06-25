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
- Use `micro-agent-orchestrator` for implementation across service, utility, API, and test layers.
- Use `smriti-shruti` to reduce noisy context before continuing.
- Use `oppenheimer-simplifier` to simplify tangled problems before choosing an implementation or review skill.
- Use `critical-thinking` before agreeing to designs or implementation requests that may be anti-patterns. Claude should say no when needed and offer a safer alternative.
- Use `product-competitive-thinking` before product-facing implementation, MVP scoping, onboarding, UX, pricing, or competitor-driven feature requests.
- Use `product-communication` for Slack, Teams, email, ticket, issue, PR, stakeholder, customer, and product decision messages that need kind but firm wording.
- Use `macos-reminder` for `/remember`, "remind me", or "notify me" requests that should become local macOS notifications.
- Use `incident-response` for production degradation, outages, rollback/hotfix decisions, on-call triage, and post-mortems.
- Use `observability-design` when adding or reviewing logs, metrics, traces, SLOs, dashboards, alerts, or telemetry gaps.
- For Go, React, Python scripting, Kubernetes, AWS, and Azure work, use the matching shared knowledge reference when the stack affects the task.
- Use `self-amending-skill` when real usage shows that skills, routing, validation, or supporting scripts should be improved.
- For skill-system changes, prefer `npm run skills:check`; regenerate catalog and graph artifacts when inventory, metadata, or references change.
