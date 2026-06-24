---
name: oppenheimer-simplifier
description: Simplify complex engineering problems into smaller first-principles pieces before solving. Use when an AI agent faces ambiguous bugs, tangled architecture, multi-system failures, unclear requirements, high cognitive load, or issues where direct implementation would likely thrash.
---

# Oppenheimer Simplifier

Use this skill before solving a hard problem. Reduce the problem until the next move is obvious enough to test.

## Workflow

1. Restate the problem in one sentence using observable behavior.
2. Separate facts, assumptions, unknowns, and constraints.
3. Identify the smallest system boundary where the issue can be reproduced or reasoned about.
4. Break the problem into independent questions that can be answered by reading code, running a command, or changing one thing.
5. Choose the highest-leverage next step and defer the rest.
6. Hand off to the relevant implementation or review skill once the problem is simplified.

## Simplification Moves

- Replace a broad question with a falsifiable hypothesis.
- Reduce a workflow to inputs, transformation, output, and side effects.
- Collapse architecture debate into ownership, dependency direction, and change frequency.
- Convert vague risk into a concrete failure mode and test.
- Split mixed concerns into API, service, utility, schema, and test pieces.

## Output

Return a compact problem frame:

- Simplified problem
- Known facts
- Key unknowns
- Candidate causes or approaches
- Next decisive action
- Skill handoff, if needed
