---
name: utility-writer
description: Write small reusable utility code such as pure helpers, parsers, formatters, validators, mappers, adapters, and low-level transformations. Use when an AI agent needs shared code that is independent of API transport, service orchestration, and persistent domain workflow.
---

# Utility Writer

Use this skill for focused helper code. Utilities should be boring, testable, and hard to misuse.

For Go helpers, read `../_knowledge/golang/go-engineering.md`. For Python scripts or automation helpers, read `../_knowledge/python/python-scripting.md`. In this repository, use `../../knowledge/golang/go-engineering.md` or `../../knowledge/python/python-scripting.md`.

## Workflow

1. Inspect existing helper modules before creating a new utility.
2. Confirm the helper has at least one real caller and a clear boundary.
3. Prefer pure functions with explicit inputs and outputs.
4. Keep names specific about units, formats, nullability, and failure behavior.
5. Handle edge cases directly or document why callers own them.
6. Add small table-driven tests through `test-writer` when behavior has branches or edge cases.

## Checks

- The utility does not depend on service state, request objects, global mutable state, or framework-specific transport details.
- The function is not a premature abstraction for one unclear call site.
- Error handling is predictable: return value, thrown error, or typed result, matching local style.
- Inputs and outputs make data shape and units obvious.

## Output

Provide the utility, representative call-site integration when needed, and focused tests for edge behavior.
