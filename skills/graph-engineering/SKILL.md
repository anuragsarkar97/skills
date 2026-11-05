---
name: graph-engineering
description: Design and review knowledge graphs, dependency graphs, and GraphRAG pipelines. Use for entity identity, provenance, temporal facts, traversal, or graph retrieval quality; not workflow orchestration.
---

# Graph Engineering

Start with questions that require relationships. Choose a graph only when measured retrieval or traversal needs justify it over joins, search, or a simple adjacency structure. No graph database is required for a small dependency map.

For modeling, ingestion, retrieval, temporal memory, and current graph capabilities, read `../_knowledge/graphs/graph-engineering.md` when installed or `../../knowledge/graphs/graph-engineering.md` in this repository. Use `agentic-engineering` for execution graphs; use existing repository discovery tooling for a file map.

## Model and Ground

- Define node identity, edge semantics/direction, property types, cardinality, ownership, and required query patterns before choosing storage.
- Use stable source identifiers and tenant-aware keys. Distinguish extracted mentions, canonical entities, asserted relationships, and inferred relationships; do not merge entities solely because names or embeddings are similar.
- Attach source IDs, locators, extraction version, and timestamps to derived facts. Preserve uncertainty and conflicts. For changing facts, separate validity time from ingestion time and define supersession rules.
- For code/dependency graphs, distinguish syntactic imports from resolved dependencies and observed runtime edges. Attach extractor/version and source revision; do not present an inferred call graph as exact.

## Ingest and Query

- Make imports replayable and resumable with stable keys, deterministic batch identities, deduplication, and quarantine for invalid records. Apply constraints appropriate to the actual engine/version; do not assume an upsert alone prevents concurrent duplicates.
- Define incremental update, deletion, and reindex behavior across edges, embeddings, caches, and community summaries. Keep original source evidence so extraction can be corrected.
- Bound traversal depth, fan-out, runtime, and result size. Parameterize queries, restrict generated query capabilities, and inspect execution plans on representative data.
- Enforce authorization before traversal and retrieval aggregation, including summaries and embeddings. Post-filtering a generated answer cannot undo cross-tenant context exposure.
- Compare graph retrieval with lexical/vector or relational baselines on the same questions and budget. Measure answer support, retrieval coverage, freshness, latency, and indexing cost; abstain when evidence is missing.

## Completion Check

Produce the minimal model and query/ingestion change the task needs, with evidence paths to sources. Test entity collisions, duplicate imports, contradictory or stale facts, missing relationships, cycles/high-degree nodes, source deletion, and tenant isolation where relevant. Report coverage and cost limits rather than promising that GraphRAG is automatically more accurate.
