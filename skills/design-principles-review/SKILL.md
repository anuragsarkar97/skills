---
name: design-principles-review
description: Review software design against SOLID, YAGNI, cohesion, coupling, dependency direction, abstraction quality, boundaries, and maintainability. Use when an AI agent evaluates architecture, refactors, class or module design, service boundaries, or whether a pattern is justified.
---

# Design Principles Review

Use this skill when design choices matter more than line-level correctness. Apply principles as tools for reasoning, not as slogans.

For deeper architecture, SOLID, YAGNI, and boundary guidance, read `../_knowledge/architecture/principles.md` when installed or `../../knowledge/architecture/principles.md` in this repository.

## Workflow

1. Identify the current force: feature pressure, change frequency, domain uncertainty, performance, team ownership, or production risk.
2. Inspect existing architecture and dependency direction before recommending patterns.
3. Check whether each abstraction has a current caller, current variation, or proven pressure.
4. Prefer simple, cohesive modules unless complexity is already present and repeated.
5. Separate design findings that block the change from long-term improvement ideas.

## Review Checks

- Single responsibility: modules have one reason to change and expose focused behavior.
- Open/closed: extension points exist only where variation is real, not speculative.
- Liskov: subclasses or implementations preserve caller expectations.
- Interface segregation: callers do not depend on methods or data they do not need.
- Dependency inversion: stable policy does not depend directly on volatile details.
- YAGNI: abstractions, factories, configs, and layers are justified by current needs.
- Coupling and cohesion: related behavior lives together and unrelated systems are not entangled.

## Output

Tie each design concern to a concrete future change, bug risk, or maintenance cost. Recommend the smallest design adjustment that addresses the pressure.
