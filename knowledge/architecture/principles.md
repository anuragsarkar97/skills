# Architecture Principles

Use this reference when reviewing service boundaries, abstractions, dependency direction, SOLID, YAGNI, or maintainability tradeoffs.

## Decision Heuristics

- Optimize for the smallest design that protects the known change path.
- Prefer boring boundaries: API layer validates and maps transport concerns, service layer owns workflows and permissions, data layer owns persistence details.
- Add abstractions only when at least two concrete callers or implementations create real duplication or volatility.
- Keep dependency direction inward: product workflows should not depend on HTTP frameworks, job runners, or storage details.
- Treat irreversible choices, data model changes, public contracts, auth behavior, and billing logic as high-friction decisions that need stronger review.
- Push back on requests that trade correctness, observability, or user trust for short-term speed without a clear rollback path.

## Smells

- Business rules inside route handlers.
- Shared utility packages that know product policy.
- Generic managers, processors, helpers, or engines without a narrow domain meaning.
- Premature event-driven design for a workflow that is still single-process and synchronous.
- Refactors that change shape without reducing risk, complexity, or future cost.

## Twelve-Factor Application Principles

For services deployed to cloud environments, these factors prevent the most common configuration, stateful-process, and operational anti-patterns (source: https://12factor.net/):

- **Config in the environment**: no credentials, URLs, or environment-specific values in code. The codebase should be publishable at any moment without exposing secrets.
- **Backing services as attached resources**: databases, queues, caches, and external APIs are interchangeable resources accessed via config. Swapping a local database for a managed service should require only a config change, not a code change.
- **Strict build/release/run separation**: releases are immutable. Build compiles source; release combines build with config; run executes it. Any change demands a new release — this makes rollbacks straightforward and deploys auditable.
- **Stateless processes**: processes share nothing. Any persistent state lives in a backing service. No sticky sessions or local filesystem assumptions — any instance can serve any request.
- **Disposability**: processes start fast and stop gracefully on SIGTERM. Workloads must be re-entrant or queued, not assumed to complete once started. This enables rapid scaling and resilient deploys.
- **Logs as event streams**: the app writes unbuffered events to stdout; the execution environment routes them. This decouples the app from its observability infrastructure entirely.

These factors are especially relevant at startup scale: teams are small, deploys are frequent, and misconfigured secrets or stateful processes cause disproportionate incidents.

## Source Notes

- SOLID principles are commonly traced to Robert C. Martin's design principles: https://web.archive.org/web/20210224171401/http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod
- YAGNI is documented by Extreme Programming guidance: https://martinfowler.com/bliki/Yagni.html
- Dependency inversion and clean boundary thinking are summarized by Martin Fowler's architecture writing: https://martinfowler.com/architecture/
- Twelve-Factor App methodology: https://12factor.net/
