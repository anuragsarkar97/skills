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

## Source Notes

- PostgreSQL constraints and indexing documentation are useful primary references: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL index behavior is documented here: https://www.postgresql.org/docs/current/indexes.html
- OWASP data minimization and privacy principles are summarized in privacy guidance: https://owasp.org/www-project-top-10-privacy-risks/
