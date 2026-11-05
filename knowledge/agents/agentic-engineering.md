# Agentic Engineering

Use for applications whose model selects tools or actions. Reviewed 2026-11-05. Architecture rules here are engineering recommendations; check installed SDK and runtime versions before copying vendor API examples.

## State and Execution

Separate the model/tool loop from execution infrastructure and the application that submits work and handles results. Hosted runtimes can supply the loop; build a custom harness only for an unmet requirement. A fixed workflow often needs ordinary code rather than autonomous planning.

A run needs a durable identity, actor/tenant, objective, status, current step, relevant evidence, pending operations, cancellation state, and consumed budget. Persist only what recovery needs. Define transition ownership and concurrent-update behavior; avoid shared mutable state across workers without coordination.

Execution graphs model steps and transitions, not domain facts. Use them for real routing, joins, retries, interrupts, and recovery requirements. Parallel branches need deterministic merge/conflict behavior. Handoffs need explicit inputs, expected artifacts, and failure propagation; adding agents does not create independent evidence by itself.

## Tools and Context

Validate arguments and permissions in the executor, even when the schema is strict. Treat retrieved pages and tool results as data, not authority to widen permissions. Validate outputs before using them in subsequent calls. Return actionable structured errors, bounded evidence, and correlation IDs.

Tool discovery is useful when the catalog is large and tasks need only a few tools. Keep tool groups and descriptions discriminating; test that discovery finds the necessary capability. It is not an authorization mechanism. A smaller eager tool set may be simpler and faster.

Programmatic calling can compose independent reads and filter large intermediate results before returning evidence to the model. Respect dependency order and per-call authorization. In the documented OpenAI integration, deferred tools must be discovered before a program that needs them starts. Do not transplant configuration between Responses, Agents API, and SDK integrations without checking their docs.

Keep current task context separate from durable application memory. Memory needs provenance, actor/tenant scope, correction, expiry, and deletion. Store only useful facts; a raw transcript or vector similarity match is not proof that an instruction is current or authorized.

## Recovery and Evaluation

Assume retryable work can execute again. Checkpointing local graph state does not atomically commit an external payment, email, or database write. Use an operation key derived from already-durable identity and downstream deduplication where supported. If acknowledgement is lost, reconcile external status rather than assuming the action failed. When deduplication is unavailable, use an explicit reconciliation/manual recovery path instead of a blind retry.

Cancellation must stop new actions and account for in-flight operations. A resumed interrupt must validate current permissions, operation arguments, and resource state. Do not interpret a previously approved read as approval for a newly proposed write.

Test the end state and disallowed actions, not only the chosen tool sequence. Cover crash after external success but before checkpoint, duplicate messages, expired approval, denied scope, unavailable tools, and exhausted budgets when relevant. Version prompts, tools, models, and evaluation cases together so regressions can be attributed.

## Source Notes

- OpenAI current Agents API architecture distinguishes hosted harness, environment, and application server: https://developers.openai.com/api/docs/guides/agents-api/architecture
- OpenAI current tool search documentation describes eager/deferred discovery and integration-specific configuration: https://developers.openai.com/api/docs/guides/tools-tool-search
- OpenAI current programmatic tool calling documentation explains code-mediated calls and the requirement to discover deferred tools before starting a program that needs them: https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling
- LangGraph persistence distinguishes thread checkpoints from cross-thread stores: https://docs.langchain.com/oss/python/langgraph/persistence
- LangGraph fault tolerance documents node re-execution, durable operation keys, and unknown external outcomes: https://docs.langchain.com/oss/python/langgraph/fault-tolerance
