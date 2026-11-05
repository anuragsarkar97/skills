# Skill review — 2026-11-05

Reviewed all 31 canonical skill files for incremental value beyond a capable coding model. Retained 25 specialized workflows and removed six generic instruction sets. These are repository design judgments, not measured claims that a newer model makes every skill unnecessary.

## Current evidence

The live [OpenAI skill and prompt maintenance guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) recommends short, specific descriptions, progressive disclosure, and contextual reference loading. It warns that older step-by-step scaffolding and excessive approval boundaries can slow or prematurely stop newer agents. The [current model guide](https://developers.openai.com/api/docs/guides/latest-model) and [skill authoring documentation](https://learn.chatgpt.com/docs/build-skills) were also consulted.

Apply those principles without pinning portable skills to a model name, assuming tool availability, or weakening permission and data boundaries. A stronger model still benefits from repeatable operations, concrete references, templates, and repository-specific validation.

## Removed skills

| Skill | Evidence and replacement |
|---|---|
| `caveman-mode` | A long sentence-classification protocol for a simple verbosity preference. Ask for concise output directly; shared operating principles retain output discipline. |
| `smriti-shruti` | Generic context classification duplicated shared operating principles. Preserve constraints and evidence, filter logs, and reread source when needed without loading another skill. |
| `oppenheimer-simplifier` | Generic decomposition duplicated planning and critical thinking. Existing planning and decision workflows cover facts, assumptions, scope, and the next decisive check. |
| `naming-review` | General identifier advice did not provide a distinct tool or specialized workflow. Code review now checks domain vocabulary, units, public compatibility, and rename churn. |
| `utility-writer` | Generic helper-writing instructions and extra handoffs added little beyond normal implementation. Follow existing helper conventions and integrate actual callers. Stack references remain available. |
| `test-writer` | Substantially overlapped test-design review and normal implementation verification. API/service workflows retain behavioral tests; dedicated adequacy review remains available. |

## Retained skills

All retained descriptions were shortened and narrowed. A skill should contribute a specific workflow, artifact, reference, or risk review rather than activate for every mention of its subject.

| Skill | Incremental value and decision |
|---|---|
| `agent-skill-router` | Keep as a compact selector; allow no additional skill and remove the combinatorial chain of automatic handoffs. |
| `api-review` | Keep contract compatibility, pagination, idempotency, and error-semantics review separate from implementation. |
| `api-writer` | Keep boundary validation, authorization, and error mapping; remove mandatory sibling invocations and new-layer pressure. |
| `code-documentation` | Keep documentation deliverables and code/doc consistency checks; avoid triggering for every explanation. |
| `code-review` | Keep evidence-backed and adversarial review; make severity explicit and absorb useful naming checks. |
| `commit-pr-writer` | Keep diff-grounded delivery text; use the repository template and scale detail to the change. |
| `critical-thinking` | Keep focused challenge of a disputed risky approach; avoid a universal pre-implementation gate. |
| `database-schema-design` | Keep constraints, indexes, lifecycle, and migration rollout; avoid activation for every database query. |
| `decision-memory` | Keep the bundled decision ledger and supersession workflow; consult when revisiting rationale. |
| `design-principles-review` | Keep dedicated boundary/abstraction review; avoid treating design principles as required ceremony for local edits. |
| `doc-template-writer` | Keep bundled fill-in templates and explicit placeholder semantics. |
| `implementation-plan` | Keep sequencing and rollout dependencies; distinguish planning-only requests from requests to implement. |
| `incident-response` | Keep production mitigation, rollback/hotfix tradeoffs, and post-mortem workflow. |
| `macos-reminder` | Keep local launchd tooling and time parsing; clear scheduling requests authorize scheduling, ambiguous times require clarification. |
| `observability-design` | Keep telemetry design, noise audits, SLOs, and actionable alerts. |
| `product-communication` | Keep substantive disagreement/decision communication; avoid loading for every short reply. |
| `product-competitive-thinking` | Keep product bets and competitive tradeoffs; avoid a strategy gate for every UI edit. |
| `repository-map` | Keep deterministic discovery scripts and incremental maps; skip known-path edits and make agent enrichment optional. |
| `security-review` | Keep reachable attack-path and privacy review at changed trust boundaries. |
| `self-amending-skill` | Keep evidence-backed maintenance and repository validation; do not modify skills during unrelated work. |
| `service-writer` | Keep transaction, permission, retry, and side-effect boundaries; finish integration without sibling-skill handoffs. |
| `test-design-review` | Keep adequacy, false-confidence, mock, and flakiness review; avoid loading for routine test implementation. |
| `upskilling-research` | Keep verified resource curation; do not impose a month-long curriculum on a request for a few reads. |
| `work-impact-tracker` | Keep the private local worklog and evidence/ownership distinction. |
| `wtf-check` | Keep an explicit course-correction workflow for observed thrash; avoid diagnosing the user's motives or blocking routine uncertainty. |

## System changes and validation

Updated root instructions, agent usage notes, bootstrap text, frontend profile, prompt fixtures, and generated catalog/graph/knowledge indexes. Removed retired writer names from structural evaluation requirements. Source files remain canonical; frontmatter still contains only `name` and `description`.

Run `npm test` for the full local gate. It includes skill validation, audit, prompt fixture checks, script tests, structural evaluation, and source metadata checks. Catalog, graph, and knowledge index generators must be run after inventory changes. These checks establish repository consistency; they do not measure routing accuracy or task quality on a live model.

## Migration and limits

The installer preserves existing skill folders and shared knowledge unless `--force` is supplied, and preserves removed skills by default. Review local edits before forcing an upgrade. The optional `--remove-stale` flag removes managed installs outside the selected skill set, including dangling links into the current source skills directory. Preview it without `--write` first. It removes all deselected managed skills, not only the six retired names; do not combine a partial profile with cleanup unless that is intended. Inspect local customizations before cleanup, because ownership markers do not prove files are unmodified. Unmarked folders and links outside the current source skills directory are preserved. No global installation was modified during this review. Explicit selection of a retired skill name will no longer work in a fresh install; use the replacements above.

No npm release, remote push, production action, or live model benchmark is part of this change. Reconsider retention or removal after representative tasks demonstrate a concrete regression or unnecessary overhead. Domain knowledge packs were preserved; their framework and cloud guidance was not comprehensively refreshed against upstream releases in this review.

## Second consolidation — 2026-11-06

After adding specialized agent, graph, and design workflows, reviewed the remaining generic skills again. Removed seven overlapping instruction sets, reducing the active catalog from 29 to 22. This is a maintenance judgment based on their content and overlap, not a measured claim about task success or latency.

| Removed skill | Reason and replacement |
|---|---|
| `critical-thinking` | Generic decision/challenge protocol duplicated planning, product evaluation, and code review. Evidence-backed pushback remains an engineering default. |
| `wtf-check` | Generic drift correction added a separate mode and scripted output. Shared defaults retain a concise reset when work stops serving the goal. |
| `design-principles-review` | Boundary and abstraction checks duplicated code review and the retained architecture knowledge pack. |
| `api-writer` | Handler-writing checklist overlapped ordinary implementation and API contract review. Validation, authorization, and error handling remain required at boundaries. |
| `service-writer` | Business orchestration checklist overlapped ordinary implementation, domain reviews, and stack references. Transaction and side-effect checks remain in shared defaults. |
| `code-documentation` | Generic documentation-writing guidance did not supply unique tooling or templates. Code review checks stale docs; document templates remain available. |
| `commit-pr-writer` | Diff-based delivery writing is a normal agent capability. Shared defaults retain evidence-grounded descriptions and explicit action authorization. |

The source catalog, router, frontend profile, prompt fixtures, evaluation requirements, and knowledge index are updated together. Useful architecture, API, security, testing, and communication references remain available without loading a separate generic skill.

Earlier sections are historical snapshots. For current migrations, both the original six retired names and these seven names may remain in existing installs. No global installed folders are changed by this repository edit. Review the cleanup options and local customizations before removing them; a fresh install contains only the current catalog. These changes are not automatically committed or pushed.

## Core engineering catalog — 2026-11-06

Following the request for roughly 10–15 skills, reduced the current catalog from 22 to 14. The final set is:

- Routing and repository work: `agent-skill-router`, `repository-map`, `implementation-plan`, `decision-memory`.
- Product and frontend direction: `product-competitive-thinking`, `dribbble-design`.
- Agent and graph systems: `harness-engineering`, `agentic-engineering`, `graph-engineering`.
- Quality and operations: `code-review`, `security-review`, `database-schema-design`, `incident-response`, `observability-design`.

Removed eight additional entrypoints:

| Removed skill | Scope decision |
|---|---|
| `macos-reminder` | Personal notifications do not belong in the core engineering catalog. Bundled scheduler removed; existing user reminders are untouched. |
| `work-impact-tracker` | Personal appraisal/worklog tooling is outside the core scope. Removed its source script and tests; existing user worklogs are untouched. |
| `upskilling-research` | Learning-resource curation is a normal research task rather than a core repository workflow. |
| `doc-template-writer` | Document template generation is outside the focused engineering set. |
| `product-communication` | Standalone message writing does not need another skill. The communication reference remains for incident and decision context. |
| `test-design-review` | Merged test adequacy, false-confidence, and flakiness checks into `code-review`; testing references remain. |
| `api-review` | Merged contract review into `code-review`; security review can read the retained API reference directly. |
| `self-amending-skill` | Skill maintenance follows the repository's existing canonical-file, metadata, audit, catalog, graph, and test instructions. No separate installed mode is needed. |

Updated the frontend profile, fixtures, CLI check commands, script tests, and bundle verification along with the removals. API and test-review examples now route to `code-review`. Shared domain references remain available on demand. Removing repository tools does not cancel local reminders or delete personal records and does not prune global installed folders.
