---
name: repository-map
description: Generate and use compact repository context and a per-file CSV map for faster cold starts and smaller targeted searches. Use when an AI agent explores an unfamiliar codebase or needs stack, commands, entry points, CI, deployment, migrations, ownership, important files, or public-symbol guidance.
---

# Repository Map

Use this skill to create disposable discovery aids that shrink cold starts. Prefer filtered CSV rows over loading whole maps into context:

- `project-context.json` identifies stack, commands, entry points, CI, deployment, migrations, ownership, and important files.
- `repo-files.csv` is one row per indexed file with role, layer, purpose, exports, imports, and enrichment metadata.
- `repo-symbols.csv` is an optional symbol lookup keyed by path.
- `repo-map.state.json` tracks freshness for `--check` and enrichment stats.

Build, dependency, cache, lockfile, binary, minified, and data-dump paths are skipped.

## Workflow

1. Generate or refresh `.skill-context/project-context.json`.
2. Look for `.skill-context/repo-map.state.json` plus the CSV artifacts.
3. Run the map generator with `--check`. If the map is missing or stale, regenerate it.
4. Read `project-context.json` first for stack and commands.
5. Do **not** load entire CSVs into context. Grep or filter `repo-files.csv` by path prefix, `role`, `layer`, `tags`, or keywords in `purpose`.
6. Open `repo-symbols.csv` only when looking up a known symbol name.
7. Enrich weak rows (`enrichment_status=pending`) before broad exploration when higher-quality purpose text will save reads.
8. Read the few matching source files; verify behavior before editing. Heuristic rows are fast; enriched rows are AI-reviewed summaries.

## Commands

Resolve this skill's directory, then run:

```bash
node <skill-dir>/scripts/repository-map.mjs --path <repository>
node <skill-dir>/scripts/repository-map.mjs --path <repository> --check
node <skill-dir>/scripts/repository-map.mjs --path <repository> --full
node <skill-dir>/scripts/project-context.mjs --path <repository>
node <skill-dir>/scripts/repository-map-enrich.mjs --path <repository> --mock
node <skill-dir>/scripts/repository-map-enrich.mjs --path <repository> --batch-size 5
```

Default outputs live under `<repository>/.skill-context/`. `--out` selects the output directory. Use `--max-files` and `--max-symbols` for large repositories.

### Enrichment

- `repository-map` writes baseline rows quickly. Rows without a docstring get `enrichment_status=pending`.
- `repository-map-enrich` upgrades pending rows (and optionally heuristic rows with `--include-heuristic`).
- `--mock` runs deterministic enrichment for tests or offline use.
- Without `--mock`, set `CURSOR_API_KEY` and install `@cursor/sdk` for Cursor SDK enrichment.
- Pass explicit paths after options to enrich only those files: `... --mock src/foo.ts`.

## Multi-Agent Orchestration

When running inside Cursor without the SDK, the parent agent can orchestrate enrichment:

1. Run `repository-map` and `project-context.mjs`.
2. Filter `repo-files.csv` for `enrichment_status=pending` rows, grouped by top-level directory.
3. Spawn one subagent per directory batch (5–15 files). Give each batch: path, current purpose, exports, imports, and the first ~80 lines of source.
4. Require structured JSON back: `{ path, purpose, role, layer, tags }[]`.
5. Merge results with `repository-map-enrich --mock` only when testing, otherwise write rows through the enrich script or a small merge step.
6. Prefer enriching changed or ambiguous paths on demand instead of the whole repository.

## Regeneration Rules

- In Git repositories, regeneration reads staged, unstaged, renamed, deleted, and untracked paths, then re-extracts affected CSV rows.
- Changed files reset `enrichment_status` to `pending` or `heuristic`; unchanged enriched rows are preserved.
- Content hashes verify Git's change hints and catch reverts, branch switches, or incompatible prior maps.
- If incremental verification cannot prove correctness, the generator performs a full rebuild.
- Outside Git repositories, the generator performs a full filesystem scan.
- Universal Ctags is optional. The generator uses it only when `ctags --version` identifies Universal Ctags; incompatible BSD Ctags is ignored.

## Output

Produce both discovery artifacts and use them to guide exploration. Report detected stack, commands, entry points, operational files, map freshness, enrichment coverage, and any truncation or language-coverage warnings.
