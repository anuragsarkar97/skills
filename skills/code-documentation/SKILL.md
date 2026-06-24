---
name: code-documentation
description: Create and review practical code documentation, including docstrings, inline comments, README sections, API docs, architecture notes, examples, migration notes, and operational guidance. Use when an AI agent documents behavior, explains usage, or evaluates whether documentation matches code.
---

# Code Documentation

Use this skill when documentation should help a future engineer use, change, operate, or review code. Document why and how, not obvious syntax.

## Workflow

1. Inspect the code before writing docs. Documentation must match current behavior.
2. Identify the audience: caller, maintainer, operator, reviewer, or integrator.
3. Document non-obvious constraints, invariants, failure modes, side effects, and examples.
4. Keep docs close to the code when they describe local behavior; use separate docs for workflows or architecture.
5. Remove stale or misleading docs instead of expanding around them.

## Documentation Checks

- Public APIs describe inputs, outputs, errors, permissions, and examples.
- Complex code comments explain intent, tradeoffs, or invariants rather than restating the line.
- READMEs include setup, common commands, environment assumptions, and verification steps when relevant.
- Architecture notes include context, decision, alternatives rejected, and consequences.
- Documentation does not promise behavior the tests or code do not support.

## Output

Prefer small, concrete documentation patches. When reviewing docs, identify stale claims, missing operational facts, and places where a code change would be clearer than a comment.
