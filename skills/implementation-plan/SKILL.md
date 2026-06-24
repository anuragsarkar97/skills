---
name: implementation-plan
description: Create pragmatic implementation plans for software changes, refactors, migrations, and feature work. Use when an AI agent needs to break a coding task into scoped steps, identify risks, choose validation commands, or coordinate incremental delivery.
---

# Implementation Plan

Create a plan only after inspecting available project context. Keep the plan tied to files, systems, and validation commands that actually exist.

## Workflow

1. Identify the user-visible outcome and the smallest complete slice of work.
2. Inspect current patterns before proposing new abstractions.
3. Split work into steps that can be implemented and verified independently.
4. Call out decisions that need user input only when research cannot resolve them.
5. Include validation commands and expected signals.

## Plan Shape

Prefer short ordered steps. Each step should state:

- What changes.
- Where it changes.
- How to verify it.

Keep alternatives brief and include the tradeoff that matters for the current codebase.
