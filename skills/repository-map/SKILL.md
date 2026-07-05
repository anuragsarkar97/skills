---
name: repository-map
description: Generate and use a compact semantic repository map for faster cold starts and smaller targeted searches. Use when an AI agent explores an unfamiliar codebase, refreshes project context, or needs file and public-symbol guidance before reading implementation details.
---

# Repository Map

Use this skill to create a disposable navigation aid, not a replacement for reading source code. The map identifies likely entry points, important files, and public or key symbols so subsequent searches can stay narrow.

## Workflow

1. Look for `.skill-context/repo-map.md`.
2. Run the bundled generator with `--check`. If the map is missing or stale, regenerate it.
3. Read the map before opening broad directory trees or running repository-wide symbol searches.
4. Use paths and symbol names from the map to make targeted `rg` searches and focused file reads.
5. Verify behavior against source code before editing; descriptions come only from source comments and may be absent.

## Commands

Resolve this skill's directory, then run:

```bash
node <skill-dir>/scripts/repository-map.mjs --path <repository>
node <skill-dir>/scripts/repository-map.mjs --path <repository> --check
node <skill-dir>/scripts/repository-map.mjs --path <repository> --full
```

The default output is `<repository>/.skill-context/repo-map.md`. Use `--out`, `--max-files`, or `--max-symbols` when the repository needs different bounds.

## Regeneration Rules

- In Git repositories, regeneration reads staged, unstaged, renamed, deleted, and untracked paths, then re-extracts affected sections.
- Content hashes verify Git's change hints and catch reverts, branch switches, or incompatible prior maps.
- If incremental verification cannot prove correctness, the generator performs a full rebuild.
- Outside Git repositories, the generator performs a full filesystem scan.
- Universal Ctags is optional. The generator uses it only when `ctags --version` identifies Universal Ctags; incompatible BSD Ctags is ignored.

## Output

Produce `.skill-context/repo-map.md` and then use it to guide exploration. Report whether the map was fresh, incrementally regenerated, or fully rebuilt, plus any truncation or language-coverage warnings printed by the generator.
