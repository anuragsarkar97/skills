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

## Source Notes

- SOLID principles are commonly traced to Robert C. Martin's design principles: https://web.archive.org/web/20210224171401/http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod
- YAGNI is documented by Extreme Programming guidance: https://martinfowler.com/bliki/Yagni.html
- Dependency inversion and clean boundary thinking are summarized by Martin Fowler's architecture writing: https://martinfowler.com/architecture/
