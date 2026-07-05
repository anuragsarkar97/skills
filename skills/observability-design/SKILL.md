---
name: observability-design
description: Design and implement structured logs, metrics, distributed traces, and alerts for services. Use when an AI agent adds appropriate logs to existing code, instruments errors or workflows, audits logging coverage or noise, adds service telemetry, defines metric naming conventions, designs dashboards, or sets alert thresholds.
---

# Observability Design

Use this skill when adding or reviewing telemetry. Good observability is not about logging everything — it is about being able to answer "what broke, when, for whom, and why" without a second deploy.

For deeper observability guidance, read `../_knowledge/observability/observability-design.md` when installed or `../../knowledge/observability/observability-design.md` in this repository.

For Kubernetes telemetry, read `../_knowledge/kubernetes/kubernetes-operations.md`. For AWS or Azure telemetry, read `../_knowledge/cloud/aws-azure-architecture.md`.

Never log secrets, tokens, passwords, full request bodies containing PII, or internal stack traces in production-facing log sinks. Read `../_knowledge/security/security-review.md` when telemetry touches auth, payments, or PII fields.

## Workflow

1. Identify the questions you need to answer in production: errors, latency, throughput, resource saturation, and business-level events (order placed, payment failed, user signed up).
2. Design structured log events for each meaningful state transition and error path.
3. Define metrics with consistent naming, cardinality awareness, and appropriate type (counter, gauge, histogram).
4. Add trace context propagation at service entry points and across async boundaries.
5. Define alert thresholds anchored to user impact: error rate, p99 latency, queue depth, not raw infrastructure metrics.
6. Verify that a hypothetical debug scenario (e.g., "checkout is slow for one tenant") can be answered from the telemetry alone.

## Adding Logs To Existing Code

1. Inspect the repository's logger, middleware, error handling, correlation fields, and nearby event naming before editing.
2. Map the workflow's meaningful boundaries and failure paths. Add logs only where they answer a concrete operational question.
3. Reuse the existing structured logger and field conventions. Do not introduce `print`, `console.log`, or a second logging library unless the repository already uses it for the same purpose.
4. Log an error once at the layer that owns handling or reporting it. Lower layers should return contextual errors instead of producing duplicate events.
5. Preserve control flow and error semantics. Logging must not swallow failures, expose sensitive data, or turn successful behavior into a failure.
6. Test important events, levels, stable fields, correlation identifiers, and redaction when the repository has a log-capture pattern. At minimum, run focused tests for the changed paths.
7. Review the diff for noisy success logs, high-volume loops, unbounded fields, duplicate stack traces, and messages that cannot be queried reliably.

## Structured Log Design

Each log event should answer: when, what happened, who was affected, and what the outcome was.

- Prefer stable event names or messages plus structured fields over interpolated prose.
- Use consistent field names across the service: `user_id`, `tenant_id`, `request_id`, `duration_ms`, `error_code`.
- Log at boundaries: request received, external call made, external call returned, job started, job completed.
- Use log levels deliberately: ERROR for actionable failures, WARN for degraded but recoverable, INFO for significant state transitions, DEBUG for development only.
- Include correlation context already available to the workflow, but do not invent identifiers that cannot be propagated consistently.
- Avoid logging in tight loops or per-row database operations — aggregate instead.

## Metric Naming

- Format: `<service>.<noun>.<unit>` or `<service>.<noun>_<verb>_total` for counters.
- Keep cardinality bounded: label by status code, error type, or endpoint — not by user ID or request ID.
- Prefer histograms over averages for latency; p50/p95/p99 reveal tail behavior that averages hide.

## Trace Context

- Propagate trace IDs through HTTP headers, message queue attributes, and async job metadata.
- Instrument outbound HTTP calls, database queries, and queue publishes as child spans.
- Include enough span attributes to filter traces by tenant, feature, or error type.

## Alert Design

- Page on user-visible impact: error rate above baseline, latency SLO breach, payment failures.
- Avoid alerting on symptoms that don't require human action (transient retries, expected background errors).
- Every alert should have a clear runbook action or link to `incident-response`.

## Output

Produce instrumented code and a brief coverage summary: events and fields added, operational questions now answerable, validation performed, and any remaining telemetry gap.
