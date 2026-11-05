---
name: agentic-engineering
description: Build and review tool-using agents and durable agent workflows. Use for control flow, tool contracts, memory, recovery, budgets, and delegation decisions; not ordinary AI-assisted coding.
---

# Agentic Engineering

Engineer an application that uses model decisions and tools. This skill is not a requirement to turn routine development into an agent system.

For architecture selection, recovery cases, context, and current tool capabilities, read `../_knowledge/agents/agentic-engineering.md` when installed or `../../knowledge/agents/agentic-engineering.md` in this repository.

## Choose the Smallest Control Flow

- Use deterministic code for known rules and fixed sequences.
- Use one tool-using agent when intermediate evidence genuinely changes the next action.
- Use a durable workflow or execution graph when explicit branching, checkpoints, interrupts, or resumable steps are needed. A workflow graph models execution; a knowledge graph models facts.
- Introduce multiple agents only for demonstrated isolation or parallelism benefits that exceed handoff, context, and coordination costs. Designing delegation does not authorize spawning agents in the current session.

## Implementation Checks

- Define task success, stop conditions, model/tool availability, timeouts, tool-call and cost budgets, cancellation, and escalation behavior.
- Give tools clear schemas, bounded outputs, structured failures, and narrow capabilities. Enforce actor/tenant authorization in application code on every call; tool discovery and model instructions are not access control.
- Separate transient context, durable run state, and long-term memory. Preserve evidence and pending actions through compaction; scope memory reads/writes and define expiration, correction, and deletion.
- Persist operation identity before side effects. Checkpoints and retries do not guarantee exactly-once external writes. Reconcile an unknown outcome before retrying or compensating.
- Make transitions, retryable errors, terminal failures, and human interrupts explicit. On resume, recheck current authorization and external state. Bind approval to the operation and its arguments, rather than treating it as blanket permission.
- Record task, step, model/configuration, tool result, state transition, and budget usage without leaking secrets. Evaluate task outcomes and forbidden side effects with representative cases.

## Current Capabilities

When supported, on-demand tool discovery and programmatic tool calling can reduce irrelevant schemas and intermediate tool output. Confirm exact runtime support and measure discovery failures, latency, and cost before adopting them. Load needed tools before a program that invokes them; preserve permission checks inside batched calls.

## Completion Check

Verify the intended outcome plus malformed tool output, timeout, cancellation, duplicate delivery, crash/resume, and access denial where relevant. Report what was actually exercised. Use `harness-engineering` for a dedicated agent evaluation system, not as an automatic extra implementation phase.
