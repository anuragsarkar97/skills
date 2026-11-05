# Graph Engineering

Use for knowledge and dependency graphs, temporal context, and GraphRAG. Reviewed 2026-11-05. This reference gives design recommendations, not a guarantee that a graph improves a particular workload.

## Choose the Representation

Identify representative relationship questions first: dependencies, ownership, paths, entity-specific evidence, or corpus-wide themes. Compare with SQL joins/recursive queries, a small adjacency list, and lexical/vector retrieval. A visualization request alone does not justify a graph database.

Use stable canonical IDs and explicit relationship semantics. Record aliases separately from identity. Separate source assertions from inferred links and attach evidence locators and extraction versions. A confidence score is a model output unless calibrated; repeated extraction of the same source is not independent corroboration.

For a code graph, source revision and resolution strategy matter. Imports, static call candidates, runtime traces, and ownership links are different edge types with different evidence. Dynamic dispatch and generated code can leave gaps; declare those limits.

## Integrity and Lifecycle

Scope identity and retrieval by tenant. Define node/edge uniqueness and required properties explicitly; verify the database edition and version enforce the intended constraints. Schema evolution needs migration and rollback planning, not a fresh-schema example pasted onto populated data.

Maintain distinct event/validity and ingestion times when asking what was true at a past time. A contradictory new claim may be a correction, a new validity interval, a source conflict, or an entity-resolution mistake. Do not silently overwrite history to make the graph look consistent.

Incremental ingestion needs source IDs, content hashes or revisions, extraction versions, idempotent writes, and resumable batches. Propagate source updates and deletions through derived edges, embeddings, summaries, and caches. Tombstoning a source without removing its influence from retrieval can retain sensitive or false information.

## Retrieval and Grounding

Microsoft GraphRAG offers entity-focused local search, corpus-oriented global search, community-informed DRIFT search, and a basic vector baseline. Choose by question type; global map/reduce retrieval has a meaningful resource cost. Its indexing builds extracted structures and summaries, so updates also create maintenance work.

Combine lexical/entity lookup, vector candidates, and bounded graph expansion only when evaluation supports it. Apply access controls before expansion and summarization; derived community reports must not combine facts across incompatible access scopes. Limit fan-out, depth, query time, and result count. Use read-only query roles and validated templates or restricted generated queries.

Preserve supporting text and provenance in the answer path. Evaluate answer support separately from whether traversal found a plausible connection. Include unanswerable questions, entity collisions, temporal corrections, missing edges, stale summaries, source deletion, and authorization denial. Measure retrieval quality and total indexing/query cost against the same baseline dataset.

## Current Developments and Limits

Temporal context graph frameworks such as Graphiti track changing relationships and source episodes. This makes history and provenance practical concerns, but extraction and entity resolution remain fallible. Evaluate using your own changing data; do not adopt a vendor's comparative performance claims as workload evidence.

Neo4j's current graph types provide schema-level structure with version/edition requirements. Setting a graph type replaces existing graph types and constraints; inventory the current schema and migration impact first. This is not an invitation to rewrite a working database solely to use new syntax.

## Source Notes

- Microsoft GraphRAG query modes and resource tradeoffs: https://microsoft.github.io/graphrag/query/overview/
- Microsoft GraphRAG indexing pipeline and derived outputs: https://microsoft.github.io/graphrag/index/overview/
- Graphiti maintainers' temporal context graph, identity, and episode provenance model: https://github.com/getzep/graphiti
- Neo4j current constraints and edition-specific capabilities: https://neo4j.com/docs/cypher-manual/current/schema/constraints/
- Neo4j graph types, introduced for Cypher 25 Enterprise in 2026.02, and replacement semantics: https://neo4j.com/docs/cypher-manual/current/schema/graph-types/set-graph-types/
