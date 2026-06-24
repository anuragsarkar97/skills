---
name: incident-response
description: Triage and resolve production incidents by reading logs, forming hypotheses, assessing blast radius, deciding between rollback and hotfix, and coordinating status communication. Use when a production system is degraded, erroring, or down and the agent needs a structured response workflow.
---

# Incident Response

Use this skill when production is broken and time is short. The goal is to reduce mean time to resolution: establish facts fast, form hypotheses in order of likelihood, and act decisively. Do not skip steps to save time — skipping triage is how you spend four hours on the wrong fix.

For deeper incident response guidance, read `../_knowledge/incident-response/incident-response.md` when installed or `../../knowledge/incident-response/incident-response.md` in this repository. For auth or permissions incidents, read `../_knowledge/security/security-review.md`. For stakeholder and customer status communication, read `../_knowledge/communication/product-communication.md`.

## Workflow

1. **Establish current state.** What is broken, since when, which users or tenants are affected, and what changed recently (deploy, config, dependency, traffic spike).
2. **Read signals.** Pull logs, error rates, latency percentiles, and traces for the affected path. Look for the first anomaly, not just the loudest one.
3. **Form hypotheses.** List the top 2–3 causes ordered by likelihood and ease of verification. State what evidence would confirm or rule out each.
4. **Verify the most likely hypothesis first.** One targeted check beats five parallel guesses.
5. **Assess blast radius.** Who is affected, what data is at risk, and whether the incident is worsening, stable, or recovering on its own.
6. **Decide: rollback or hotfix.**
7. **Communicate status.** One clear update: what is broken, what you know, what you are doing, and when the next update will be.
8. **Resolve and document.** After the incident, write a brief post-mortem: timeline, root cause, fix, and follow-up action items.

## Rollback vs Hotfix

Default to rollback when:
- A recent deploy correlates with the incident start time.
- The fix is unknown or uncertain.
- Rollback is fast and the blast radius is still growing.

Choose hotfix when:
- Rollback would not resolve the issue (data migration already applied, external event already sent).
- The fix is known, small, and safe to deploy quickly.
- Rollback has its own risk (e.g., reverse migration is destructive).

## Triage Questions

- What is the first timestamp in the logs where behavior diverges from baseline?
- Is the error rate 100% or partial? Random or correlated (by tenant, region, feature flag)?
- What deployed or changed in the last 2 hours?
- Are retries making it worse (thundering herd, double-charge, duplicate record)?
- Is this a dependency failure (database, external API, queue) or application logic?

## Output

State: what is broken, what you found, what hypothesis you are acting on, what the next action is, and who needs to be informed. Do not write a full report mid-incident — save that for the post-mortem.
