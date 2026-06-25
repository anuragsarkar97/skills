# Incident Response Knowledge

Use this reference when triaging a production incident, managing a live outage, or writing a post-mortem.

## Severity Classification

Define severity levels before an incident — not during one. A common tiered model:

| Severity | Trigger | Response |
|---|---|---|
| **SEV-1** | Critical customer-facing outage or data loss risk | Immediate all-hands; IC assigned within minutes |
| **SEV-2** | Significant degradation affecting a subset of users or a core feature | On-call team engaged; regular updates required |
| **SEV-3** | Minor degradation, workaround available, no data loss | Tracked and scheduled for fix; no immediate escalation |

Escalate early. Trigger criteria for escalating to a higher severity: a second team is needed, customers can see the impact, or the problem is unsolved after one hour of focused work.

## Incident Roles

Assign roles explicitly at the start. The Incident Commander holds all unassigned roles by default.

| Role | Responsibility |
|---|---|
| **Incident Commander (IC)** | Owns the incident end-to-end; directs all responders; is the single decision authority |
| **Ops Lead** | The *only* people making live system changes during the incident |
| **Communications Lead** | Issues periodic updates to stakeholders; maintains the live incident doc |
| **Subject Matter Expert (SME)** | Provides domain knowledge; executes technical actions under IC direction |
| **Customer Liaison** | Handles external and customer-facing communication separately from the technical bridge |

A clear separation of responsibilities allows individual responders more autonomy — they don't need to clear every action if their role is well-defined.

## Triage Workflow

1. **Establish current state**: what is broken, since when, who is affected, what changed recently (deploy, config, dependency, traffic spike).
2. **Read signals**: pull error rates, latency percentiles, and traces for the affected path. Look for the *first* anomaly, not the loudest current symptom.
3. **Form hypotheses**: list the top 2–3 causes ordered by likelihood and ease of verification. State what evidence would confirm or rule out each.
4. **Verify the most likely hypothesis first**: one targeted check beats five parallel guesses.
5. **Assess blast radius**: who is affected, what data is at risk, whether the incident is worsening or stable.
6. **Act**: rollback or hotfix (see below).
7. **Communicate status**: one clear update with: what is broken, what you know, what you are doing, when the next update will be.

## Rollback vs Hotfix

Default to rollback when:
- A recent deploy correlates with the incident start time.
- The fix is unknown or uncertain.
- Rollback is fast and blast radius is still growing.

Choose hotfix when:
- Rollback would not resolve the issue (migration already applied, external event already sent).
- The fix is known, small, and safe to deploy quickly.
- Rollback itself carries risk (e.g., reverse migration is destructive).

## Live Incident Document

Maintain a concurrently editable document (not the system you are fixing) that captures:
- Current known state of the incident.
- Actions attempted and their outcomes.
- Who is doing what and when.

This live document is the direct input to the post-mortem. Keep it as you go — reconstructing a timeline after resolution is inaccurate.

## Handoff Protocol

At shift change, brief the incoming commander verbally, then confirm transfer explicitly:

> "You are now the incident commander, okay?"

Announce the handoff to the full response team. Do not leave without a clear verbal acknowledgment.

## Post-Mortem Structure

Write a post-mortem for every SEV-1 and SEV-2 within 48 hours of resolution. A blameless post-mortem focuses on systems and processes, not individuals.

Required sections:
1. **Impact**: who was affected, for how long, what was lost or degraded.
2. **Timeline**: chronological sequence of events from first anomaly to resolution (use the live incident doc).
3. **Root cause**: the underlying systemic cause, not just the proximate trigger.
4. **Contributing factors**: conditions that made the failure more likely or harder to detect.
5. **Resolution**: what fixed it and why it worked.
6. **Action items**: concrete follow-up tasks with owners and due dates — improved monitoring, runbooks, code fixes, process changes.

**Blameless principle**: the goal is to find what in the system made the failure possible, not to assign fault. Engineers who feel safe reporting failures provide better data for prevention.

## Triage Questions

- What is the first timestamp where behavior diverges from baseline?
- Is the error rate 100% or partial? Random or correlated by tenant, region, or feature flag?
- What deployed or changed in the last 2 hours?
- Are retries making it worse (thundering herd, double-charge, duplicate record)?
- Is this a dependency failure (database, external API, queue) or application logic?
- What is the rollback path and how long does it take?

## Source Notes

- Google SRE Book — managing incidents: https://sre.google/sre-book/managing-incidents/
- PagerDuty incident response guide: https://response.pagerduty.com/
- Blameless post-mortems and a just culture (John Allspaw): https://www.etsy.com/codeascraft/blameless-postmortems/
