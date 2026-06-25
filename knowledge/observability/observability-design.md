# Observability Design Knowledge

Use this reference when designing structured logs, metrics, distributed traces, alert thresholds, or SLI/SLO definitions for a service.

## The Four Golden Signals

If you can only measure four things on a user-facing system, measure these (Google SRE):

| Signal | Definition | Trap to Avoid |
|---|---|---|
| **Latency** | Time to service a request | Track errors separately — a fast error masks real latency; a slow error is worse than a fast one |
| **Traffic** | Demand on the system (requests/sec, sessions, transactions) | Express in service-specific terms, not generic "load" |
| **Errors** | Failed requests: explicit (5xx), implicit (200 with wrong body), policy (exceeded SLA) | Load balancers only catch hard failures — end-to-end checks catch subtle ones |
| **Saturation** | How full the most constrained resource is | Systems degrade *before* 100% — use p99 latency over short windows as an early saturation signal |

**Alert on symptoms (signals), not causes.** Causes are for debugging dashboards, not pages.

## USE vs RED Method

Choose based on what you're instrumenting:

- **USE** (Utilization, Saturation, Errors) — for infrastructure resources: CPU, memory, disk, network interfaces. Apply per resource: utilization %, queue length, error count. Any non-zero saturation is worth investigating.
- **RED** (Rate, Errors, Duration) — for services and microservices. Maps directly to golden signals traffic, errors, and latency. Use this when instrumenting an API endpoint or service handler.

## SLI / SLO / Error Budget

**SLI** — a quantitative measure of one service quality dimension. Examples: fraction of successful requests, p99 response time, data durability rate.

**SLO** — a target value for an SLI. Structure: `SLI ≤ target` or a range.

```
Good SLO shape (reveals distribution, not just a threshold):
  90%  of requests complete in < 10 ms
  99%  of requests complete in < 100 ms
  99.9% of requests complete in < 500 ms
```

**Error budget** — the allowable failure margin. A 99.9% availability SLO gives a 0.1% error budget. Burning through it fast should slow release velocity; a healthy budget enables faster shipping.

**Practical rules:**
- Don't set 100% targets — they eliminate the budget for deploying safely.
- Prefer a tighter *internal* SLO than the external one — this safety margin gives response time before users notice.
- Start loose, tighten over time. Anchoring to current performance locks in unsustainable targets.
- Use multi-level SLOs to reveal distribution shape; single thresholds hide tail behavior.

## Metric Design

- **Type selection**: counter (ever-increasing total), gauge (current value), histogram (distribution with buckets) — prefer histograms for latency so p50/p95/p99 can be computed.
- **Naming**: `<service>.<noun>.<unit>` or `<service>.<verb>_total` for counters.
- **Cardinality**: label by status code, error type, or endpoint — never by user ID, tenant ID, or request ID. High-cardinality labels cause metric storage explosion.
- **Avoid mean-only metrics** — averages hide imbalanced utilization. A system where 5% of requests are 20× slower will look healthy on mean latency alone.

## Structured Log Design

Each log event should answer: when, what happened, who was affected, outcome.

- Use consistent field names across the service: `user_id`, `tenant_id`, `request_id`, `duration_ms`, `error_code`.
- Log at boundaries: request in, external call out, external call returned, background job started/completed.
- Log levels: ERROR = actionable failure requiring human response; WARN = degraded but recoverable; INFO = significant state change; DEBUG = development only.
- Never log secrets, tokens, passwords, signed URLs, or full PII request bodies.

## Trace Context

- Propagate trace IDs through HTTP headers (W3C `traceparent`), message queue message attributes, and async job metadata.
- Instrument outbound HTTP calls, database queries, and queue publishes as child spans.
- Name spans as `<verb> <noun>`: `GET /users/:id`, `query users`, `publish order.created`.
- Include span attributes to filter by tenant, feature flag, or error type.

## Alert Design

- Page on user-visible impact: error rate above SLO threshold, p99 latency SLO breach, payment failures.
- Avoid alerting on symptoms that don't require human action: transient retries within budget, expected background errors, infrastructure metrics that don't map to user impact.
- Every alert should have a runbook or clear first action. An alert without a known response creates alert fatigue.
- Use multi-window, multi-burn-rate alerts for SLO-based alerting (fast burn = page now; slow burn = ticket).

## Source Notes

- Google SRE Book golden signals and monitoring guidance: https://sre.google/sre-book/monitoring-distributed-systems/
- Google SRE Book SLI/SLO/error budget definitions: https://sre.google/sre-book/service-level-objectives/
- USE method (Brendan Gregg): https://www.brendangregg.com/usemethod.html
- RED method overview: https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
- OpenTelemetry semantic conventions: https://opentelemetry.io/docs/concepts/semantic-conventions/
