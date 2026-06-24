---
name: implementation-plan
description: Create pragmatic implementation plans for software changes, refactors, migrations, and feature work. Use when an AI agent needs to break a coding task into scoped steps, identify risks, choose validation commands, or coordinate incremental delivery.
---

# Implementation Plan

Create a plan only after inspecting available project context. Keep the plan tied to files, systems, and validation commands that actually exist.

For architecture-level changes, read `../_knowledge/architecture/principles.md`. For changes touching auth, data migrations, or production data paths, also read `../_knowledge/security/security-review.md`.

## Workflow

1. Identify the user-visible outcome and the smallest complete slice of work.
2. Inspect current patterns before proposing new abstractions.
3. Split work into steps that can be implemented and verified independently.
4. Call out decisions that need user input only when research cannot resolve them.
5. Include validation commands and expected signals.

## When to Split into Phases

Split into phases (not just steps) when any of the following apply:

- A data migration must be deployed before application logic can use it safely.
- A breaking API or interface change requires a deprecation window.
- The work spans multiple deployable units or teams with different release cadences.
- A rollback requires reversing only part of the work.

Phases should be independently deployable. If phase 2 can't ship without phase 1 already live in production, make that dependency explicit.

## Risk Flags

Flag the following when present — they require extra scrutiny before implementation proceeds:

- **Schema migrations on live tables**: irreversible column drops, type changes, or index builds that lock large tables.
- **Breaking public contracts**: API fields, event shapes, or SDK signatures consumed by external callers.
- **Auth or permission changes**: anything that widens access, changes token validation, or removes a security check.
- **Data backfills**: large write operations that may conflict with concurrent reads or exceed transaction limits.
- **Third-party dependencies**: new packages, version upgrades, or external API changes with unclear reliability.

## Plan Shape

Prefer short ordered steps. Each step should state:

- What changes.
- Where it changes.
- How to verify it.

Keep alternatives brief and include the tradeoff that matters for the current codebase.
