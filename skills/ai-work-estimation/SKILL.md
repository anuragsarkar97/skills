---
name: ai-work-estimation
description: Estimate AI-assisted engineering work in minutes and added/deleted line ranges. Use for effort estimates, plans with estimates, task breakdowns, and work handoffs; not as a coding speed guarantee.
---

# AI Work Estimation

Estimate the actual AI-assisted workflow in the available environment. Default to minutes and expected code changes, rather than borrowing a human team's days, weeks, story points, or sprint conventions. Honor an explicit request for other units or a human-team estimate.

## Ground the Estimate

- Inspect the affected files, existing implementation patterns, callers, tests, and commands when available. State assumptions for a conceptual request without repository access.
- Define completion: implementation, affected integration, required checks, and review or deployment only when in scope. Include debugging and likely repair cycles; generating code is not the whole task.
- Use comparable observed runs or measured command durations when available. Otherwise label the estimate a rough planning range. Do not invent a universal AI speed multiplier, fixed lines-per-minute rate, or measured confidence.
- If scope is too uncertain for a useful total, estimate only the next bounded discovery step and mark implementation minutes/LOC as pending its result. Do not turn a large unknown into a confident small number.

## Time and Change Size

- Express active AI effort and validation runtime in **minutes**, using ranges proportional to uncertainty. Keep larger work in minutes and split it into verifiable slices instead of automatically converting it into days or weeks.
- Distinguish active effort from elapsed time. Identify CI queues, builds, approvals, vendor responses, deployment windows, and other external waits separately. Use minutes when their duration is known; mark unknown waits as unknown instead of disguising them as coding time.
- Give expected **added and deleted lines**, with files or affected areas. Separate implementation from tests and relevant config/docs; identify generated code, lockfiles, and bulk formatting separately so they do not inflate the meaningful change estimate.
- State the diff baseline for an existing change. Added/deleted lines are change volume, not net file growth, semantic complexity, or a productivity target. A small permission or migration change may require substantial verification.
- Totals must match the stated execution model. Sum sequential work and required waits; claim parallel elapsed-time savings only when concurrency is actually available, safe, and planned. Do not double-count test runtime inside both effort and elapsed totals.
- Re-estimate after discovery or a material scope change. Explain which assumption changed rather than preserving an obsolete promise.

## Compact Estimate

Use a small table when multiple slices make comparison useful:

| Slice | Active AI effort (min) | Validation/wait (min) | Expected added/deleted lines |
|---|---|---|---|
| Concrete task and affected area | Evidence-based range | Runtime range or unknown dependency | Implementation + tests/config as relevant |

Follow with total elapsed minutes under the stated sequence, the strongest assumptions, and the main uncertainty. For a small task, one sentence with minute and line-change ranges is enough. Do not fill a table with invented precision or add a formal estimate to every ordinary reply.

## Work Handoff

Keep the handoff actionable:

- Outcome and scope; repository/branch/revision and dirty changes when relevant and known.
- Completed work, exact checks run and their results, and any unverified behavior. Use actual diff statistics for completed changes when available, clearly distinct from estimates. Do not fabricate elapsed time from memory or claim that all lines were AI-authored from a diff alone.
- Remaining slices with estimated active minutes, validation/waits, and expected added/deleted lines. A finished handoff states no remaining work rather than inventing follow-up tasks.
- Blockers, required permissions, and the next concrete action with enough paths or commands for another engineer or agent to continue. A handoff request does not itself authorize delegation or external actions.

## Completion Check

Ensure requested estimates use minutes and meaningful line-change ranges, validation is included, external waits and assumptions are visible, and forecast numbers are distinguished from measured results. Do not promise a delivery time or infer effort solely from LOC. For handoffs, distinguish completed, verified, remaining, and blocked work.
