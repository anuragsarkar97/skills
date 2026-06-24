---
name: observability-design
description: Design and implement structured logs, metrics, distributed traces, and alerts for services. Use when an AI agent adds telemetry to a service, reviews instrumentation coverage, defines metric naming conventions, designs dashboards, or sets alert thresholds.
---

# Observability Design

Use this skill when adding or reviewing telemetry. Good observability is not about logging everything — it is about being able to answer "what broke, when, for whom, and why" without a second deploy.

For deeper observability guidance, read `../_knowledge/observability/observability-design.md` when installed or `../../knowledge/observability/observability-design.md` in this repository.

Never log secrets, tokens, passwords, full request bodies containing PII, or internal stack traces in production-facing log sinks. Read `../_knowledge/security/security-review.md` when telemetry touches auth, payments, or PII fields.

## Workflow

1. Identify the questions you need to answer in production: errors, latency, throughput, resource saturation, and business-level events (order placed, payment failed, user signed up).
2. Design structured log events for each meaningful state transition and error path.
3. Define metrics with consistent naming, cardinality awareness, and appropriate type (counter, gauge, histogram).
4. Add trace context propagation at service entry points and across async boundaries.
5. Define alert thresholds anchored to user impact: error rate, p99 latency, queue depth, not raw infrastructure metrics.
6. Verify that a hypothetical debug scenario (e.g., "checkout is slow for one tenant") can be answered from the telemetry alone.

## Structured Log Design

Each log event should answer: when, what happened, who was affected, and what the outcome was.

- Use consistent field names across the service: `user_id`, `tenant_id`, `request_id`, `duration_ms`, `error_code`.
- Log at boundaries: request received, external call made, external call returned, job started, job completed.
- Use log levels deliberately: ERROR for actionable failures, WARN for degraded but recoverable, INFO for significant state transitions, DEBUG for development only.
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

Produce instrumented code and a brief coverage summary: what can now be queried, what threshold triggers an alert, and what gap remains.
