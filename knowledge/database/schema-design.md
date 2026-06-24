# Database Schema Design Knowledge

Use this reference for entities, tables, migrations, indexes, retention, constraints, and multi-tenant persistence design.

## Design Checklist

- Model domain invariants first, then storage convenience.
- Name tables and columns after stable domain terms, not UI labels or implementation details.
- Put ownership and tenant boundaries directly in the schema where queries and permissions depend on them.
- Use constraints for invariants the database can enforce: uniqueness, required relationships, valid states, and referential integrity.
- Design indexes from query paths, cardinality, sort order, and write cost.
- Plan migrations for backfill, deploy order, rollback, and old application versions.
- Decide retention, deletion, auditability, and privacy behavior before shipping user data.

## Smells

- One table with many nullable columns for unrelated states.
- JSON blob for fields that need filtering, uniqueness, permissions, or reporting.
- Missing unique constraints for natural idempotency boundaries.
- Soft deletes without uniqueness, query, and retention rules.
- Status columns whose allowed transitions are not defined anywhere.

## Index Anti-Patterns

Indexes are bypassed silently when any of these apply:

- **Function on a column**: `UPPER(email) = ?` hides the raw value from the index. Move the transform to the value side or create a functional index.
- **Implicit type cast**: comparing a column to a mismatched type forces an internal cast — the index is skipped without error or warning.
- **Leading wildcard**: `LIKE '%value'` cannot use a B-tree index because the index is ordered by prefix. Only trailing wildcards (`'value%'`) allow index range scans.
- **Wrong composite order**: a composite index on `(A, B, C)` supports filters on `A`, `A+B`, or `A+B+C` — but not `B` or `C` alone. Place the most selective equality column first; range columns go last.

Index review checklist:
1. Are columns used bare (no functions or casts) in `WHERE`?
2. Does composite index column order match the query's filter sequence?
3. Do `LIKE` patterns use only trailing wildcards?
4. Is each index verified via an execution plan (`EXPLAIN`), not assumed to be used?
5. Is each index justified by a real query pattern, not added speculatively?

Indexes impose write overhead — add them to serve known queries, not to cover hypothetical ones.

## Zero-Downtime Migration: Expand/Contract Pattern

For live tables, never combine a structural change with application logic that depends on it in a single deploy. Use expand/contract:

1. **Expand**: add the new column or table as nullable with no application use. Deploy.
2. **Backfill**: populate existing rows as a background job or idempotent migration. Deploy.
3. **Migrate reads and writes**: deploy code that writes to both old and new; reads from new.
4. **Contract**: once all reads use the new structure and no old writes remain, drop the old column. Deploy.

Each phase is independently deployable and independently rollbackable. Skipping to a single-step migration on a large live table risks table locks, downtime, or a failed deploy with no clean rollback path.

## Source Notes

- PostgreSQL constraints and indexing documentation are useful primary references: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL index behavior is documented here: https://www.postgresql.org/docs/current/indexes.html
- OWASP data minimization and privacy principles are summarized in privacy guidance: https://owasp.org/www-project-top-10-privacy-risks/
- SQL indexing anti-patterns and index design from query access paths: https://use-the-index-luke.com/
- Expand/contract (parallel change) migration pattern: https://martinfowler.com/bliki/ParallelChange.html
