---
name: database-schema-design
description: Design and review database entities, tables, relationships, migrations, indexes, constraints, and persistence models. Use when an AI agent creates or changes schemas, ORM models, data contracts, table names, column names, keys, or data lifecycle behavior.
---

# Database Schema Design

Use this skill when a change introduces or modifies durable data shape: SQL tables, NoSQL documents, ORM entities, migrations, indexes, constraints, seed data, retention, or data access boundaries.

## Workflow

1. Identify the domain concept and its lifecycle before naming tables or fields.
2. Inspect existing schema conventions, ORM patterns, migration style, and query paths.
3. Model relationships explicitly: ownership, cardinality, optionality, uniqueness, and deletion behavior.
4. Choose constraints first, then indexes that support real access patterns.
5. Check migration safety: backfill, locking, default values, reversibility, and deploy order.
6. Review naming for domain clarity and consistency with existing database conventions.

## Review Checklist

- Primary keys, foreign keys, uniqueness, nullability, and defaults encode business invariants.
- Indexes match read/write paths and do not add avoidable write amplification.
- Timestamps, audit fields, soft-delete fields, and tenant or ownership columns follow local patterns.
- Data duplication is intentional and has a synchronization strategy.
- Sensitive data has retention, access, masking, and encryption considerations.
- Migration steps are safe for current production data volume and deployment topology.

## Output

For design tasks, provide the schema proposal, rationale, migration sequence, and query or index notes. For reviews, lead with risks and missing constraints before style comments.
