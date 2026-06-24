---
name: naming-review
description: Review and improve naming for variables, functions, classes, files, modules, database objects, API fields, events, tests, and domain concepts. Use when an AI agent creates or reviews identifiers, public contracts, terminology, or ambiguous code.
---

# Naming Review

Use this skill when names carry meaning across code, data, APIs, tests, documentation, or product language. Treat naming as design, not polish.

## Workflow

1. Inspect nearby naming conventions before suggesting changes.
2. Identify the domain concept, unit, lifecycle, and ownership represented by each name.
3. Prefer names that describe behavior, intent, and business meaning over implementation detail.
4. Check public names more strictly than local names because they become contracts.
5. Suggest renames only when the clarity gain is worth the churn.

## Naming Checks

- Names avoid vague words like `data`, `info`, `manager`, `helper`, `payload`, and `result` unless the context makes them precise.
- Boolean names read as predicates and avoid double negatives.
- Collections are plural or otherwise signal cardinality.
- Units, time zones, currency, and IDs are explicit where ambiguity can cause bugs.
- API, database, and event names use the same domain vocabulary for the same concept.
- Test names describe behavior and expected outcome, not implementation steps.

## Output

Group suggestions by impact. For each rename, include the current name, proposed name, and the reason the new name is more accurate.
