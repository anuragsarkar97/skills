---
name: writer-skill-name
description: Write focused implementation code for a specific layer or domain. Use when an AI agent must produce scoped code while preserving existing project conventions and validation.
---

# Writer Skill Name

Use this skill to implement one responsibility at a time. Keep boundaries explicit and avoid broad rewrites.

## Workflow

1. Inspect existing patterns and local helpers.
2. Identify the smallest behavior slice to implement.
3. Write code in the owning layer only.
4. Add focused tests for changed behavior.
5. Run the narrowest meaningful validation command.

## Output

State what changed, how it was validated, and what adjacent work remains.
