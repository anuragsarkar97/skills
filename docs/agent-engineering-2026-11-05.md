# Agent and graph engineering update — 2026-11-05

Added three narrowly routed skills after reviewing current primary sources. The catalog now contains 28 skills. This builds on the earlier cleanup; it does not restore generic thinking, coding, or context-management modes.

## Scope

| Skill | Owns | Does not require |
|---|---|---|
| `harness-engineering` | Coding-agent environments, reproducibility, feedback, protected graders, measured reliability | A custom hosted runtime or an agent swarm |
| `agentic-engineering` | Tool-using applications, execution graphs, scoped memory, durable state, recovery, budgets | Turning ordinary coding into autonomous orchestration |
| `graph-engineering` | Knowledge/dependency graphs, entity resolution, provenance, temporal context, GraphRAG | A graph database for a small map or a chart |

Graph engineering here means data and relationships. Execution graphs belong to agentic engineering. Existing repository-map tooling remains the right first option for file discovery. All three entrypoints are short; deeper knowledge lives in shared references loaded only for the relevant task. No framework or runtime dependency was added.

## Current directions worth incorporating

- **Agent environments and feedback:** OpenAI's February 2026 harness report emphasizes runnable applications, accessible repository knowledge, and mechanical checks. We adopt those practices without copying its experiment's autonomy or throughput claims. [OpenAI report](https://openai.com/index/harness-engineering/)
- **Measured long-running work:** Anthropic's March 2026 harness experiments use explicit evaluation criteria and structured handoffs. Its January evaluation guide distinguishes trials, graders, and outcomes. These support independent completion checks and repeated-run evaluation, rather than relying on an agent's final message. [Harness experiments](https://www.anthropic.com/research/harness-design-long-running-apps), [evaluation guide](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- **Replaceable infrastructure:** Anthropic's April 2026 architecture separates durable session records, harnesses, and sandboxes. OpenAI's current Agents API also separates the harness, environment, and application server. The practical lesson is to inspect what the host already supplies before building it again. [Anthropic architecture](https://www.anthropic.com/research/managed-agents), [OpenAI architecture](https://developers.openai.com/api/docs/guides/agents-api/architecture)
- **Context-efficient tools:** Current OpenAI documentation supports deferred tool discovery and programmatic calls. The new guidance checks actual runtime support, preserves authorization, and measures whether discovery improves the workload. These are capabilities to evaluate, not universal defaults. [Tool search](https://developers.openai.com/api/docs/guides/tools-tool-search), [programmatic calls](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Recoverable execution:** LangGraph documents checkpoints and distinct long-term stores, plus at-least-once node retries. A checkpoint does not guarantee an external action ran exactly once; durable operation identity and reconciliation remain application responsibilities. [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [fault tolerance](https://docs.langchain.com/oss/python/langgraph/fault-tolerance)
- **Graph retrieval and temporal context:** Microsoft GraphRAG supplies multiple retrieval modes; Graphiti models changing facts and episode provenance. The skill compares against simpler retrieval and requires source/update/deletion handling. Vendor comparisons are not evidence that either framework wins on this repository's users' data. [GraphRAG queries](https://microsoft.github.io/graphrag/query/overview/), [Graphiti](https://github.com/getzep/graphiti)
- **Stronger graph schema tooling, with migration risk:** Neo4j documents graph types introduced for Cypher 25 Enterprise in February 2026. Setting a graph type replaces existing graph types and constraints. The reference records version/edition checks and migration impact rather than suggesting an automatic upgrade. [Graph types](https://neo4j.com/docs/cypher-manual/current/schema/graph-types/set-graph-types/)

This is a focused scan verified on 2026-11-05, not an exhaustive news feed or a claim that these ideas were all invented recently. Prefer these durable engineering implications over a growing list of framework-specific skills. Recheck moving documentation before using exact APIs or schema syntax.

## Integration and verification

Added OpenAI metadata and Claude notes, nine realistic prompt fixtures, router entries, README coverage, and source-backed knowledge references. The existing structural evaluator checks completion sections and referenced knowledge paths. Catalog, graph, and knowledge index are regenerated for packaging.

Run `npm test` and `npm run skills:package-all`. These verify structure, fixtures, script regressions, and local packaging. They do not run paid model trials, install a graph engine, or prove task-quality improvements. No global installation, external service, or production system is changed.
